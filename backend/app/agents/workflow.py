import logging
import asyncio
from typing import TypedDict, Annotated, List
from sqlalchemy.ext.asyncio import AsyncSession

from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
from app.core.database import get_db

from app.core.config import settings
from app.models.schemas import ComplaintState

# Import individual agents
from app.agents.complaint_reader import complaint_reader_agent
from app.agents.complaint_sorter import complaint_sorter_agent
from app.agents.stats_finder import stats_finder_agent
from app.agents.risk_checker import risk_checker_agent
from app.agents.solution_helper import solution_helper_agent
from app.agents.feedback_logger import feedback_logger_agent

logger = logging.getLogger(__name__)


class ComplaintWorkflowGraph:

    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.1,
            api_key=settings.OPENAI_API_KEY,
        )
        self.graph = self._build_graph()
        self.agent_communication_log = []

    def _build_graph(self) -> StateGraph:
        workflow = StateGraph(ComplaintState)

        # Add nodes (agents)
        workflow.add_node("complaint_reader", self._complaint_reader_with_communication)
        workflow.add_node("complaint_sorter", self._complaint_sorter_with_communication)
        workflow.add_node("stats_finder", self._stats_finder_with_communication)
        workflow.add_node("risk_checker", self._risk_checker_with_communication)
        workflow.add_node("solution_helper", self._solution_helper_with_communication)
        workflow.add_node("feedback_logger", self._feedback_logger_with_communication)

        # Define the workflow edges
        workflow.set_entry_point("complaint_reader")
        workflow.add_edge("complaint_reader", "complaint_sorter")
        workflow.add_edge("complaint_sorter", "stats_finder")
        workflow.add_edge("stats_finder", "risk_checker")
        workflow.add_edge("risk_checker", "solution_helper")
        workflow.add_edge("solution_helper", "feedback_logger")
        workflow.add_edge("feedback_logger", END)

        return workflow.compile()

    async def _complaint_reader_with_communication(
        self, state: ComplaintState
    ) -> ComplaintState:
        """Delegate to complaint reader agent"""
        async with get_db() as db:
            # Log agent start
            self._log_agent_communication("complaint_reader", "starting", state)

            # Process with database session
            result_state = await complaint_reader_agent.process(state, db)

            # Send message to next agent
            await self._send_agent_message(
                from_agent="complaint_reader",
                to_agent="complaint_sorter",
                message=f"Entities extracted: {len(result_state.get('entities', {}))}, PII detected: {result_state.get('pii_detected', False)}",
                state=result_state,
            )

            return result_state

    async def _complaint_sorter_with_communication(
        self, state: ComplaintState
    ) -> ComplaintState:
        """Delegate to complaint sorter agent"""
        async with get_db() as db:
            # Check for messages from previous agent
            await self._receive_agent_message("complaint_sorter", state)

            result_state = await complaint_sorter_agent.process(state, db)

            # Send classification results to stats finder
            await self._send_agent_message(
                from_agent="complaint_sorter",
                to_agent="stats_finder",
                message=f"Classification: {result_state.get('classification', {}).get('issue_category', 'unknown')} with {result_state.get('classification', {}).get('confidence_score', 0):.2f} confidence",
                state=result_state,
            )

            return result_state

    async def _stats_finder_with_communication(
        self, state: ComplaintState
    ) -> ComplaintState:
        """Delegate to stats finder agent"""
        async with get_db() as db:
            await self._receive_agent_message("stats_finder", state)

            result_state = await stats_finder_agent.process(state, db)

            # Send benchmarking data to risk checker
            similar_count = len(result_state.get("similar_complaints", []))
            await self._send_agent_message(
                from_agent="stats_finder",
                to_agent="risk_checker",
                message=f"Found {similar_count} similar complaints, industry benchmark data available",
                state=result_state,
            )

            return result_state

    async def _risk_checker_with_communication(
        self, state: ComplaintState
    ) -> ComplaintState:
        """Delegate to risk checker agent"""
        async with get_db() as db:
            await self._receive_agent_message("risk_checker", state)

            result_state = await risk_checker_agent.process(state, db)

            # Send risk assessment to solution helper
            risk_score = result_state.get("risk_assessment", {}).get("risk_score", 0)
            risk_category = result_state.get("risk_assessment", {}).get(
                "risk_category", "medium"
            )
            await self._send_agent_message(
                from_agent="risk_checker",
                to_agent="solution_helper",
                message=f"Risk assessment: {risk_category} risk ({risk_score:.2f} score), mitigation strategies identified",
                state=result_state,
            )

            return result_state

    async def _solution_helper_with_communication(
        self, state: ComplaintState
    ) -> ComplaintState:
        """Delegate to solution helper agent"""
        async with get_db() as db:
            await self._receive_agent_message("solution_helper", state)

            result_state = await solution_helper_agent.process(state, db)

            # Send solution to feedback logger
            solution_confidence = (
                result_state.get("solution", {})
                .get("solution_metrics", {})
                .get("confidence", 0)
            )
            await self._send_agent_message(
                from_agent="solution_helper",
                to_agent="feedback_logger",
                message=f"Solution generated with {solution_confidence:.2f} confidence, ready for feedback collection",
                state=result_state,
            )

            return result_state

    async def _feedback_logger_with_communication(
        self, state: ComplaintState
    ) -> ComplaintState:
        """Delegate to feedback logger agent"""
        async with get_db() as db:
            await self._receive_agent_message("feedback_logger", state)

            result_state = await feedback_logger_agent.process(state, db)

            # Final workflow completion message
            total_time = sum(
                step["execution_time"] for step in result_state["processing_steps"]
            )
            await self._send_agent_message(
                from_agent="feedback_logger",
                to_agent="workflow_complete",
                message=f"Workflow completed successfully in {total_time:.2f}s, ready for user interaction",
                state=result_state,
            )

            return result_state

    async def _send_agent_message(
        self, from_agent: str, to_agent: str, message: str, state: ComplaintState
    ):
        """Send message between agents for communication"""
        communication_entry = {
            "timestamp": time.time(),
            "from_agent": from_agent,
            "to_agent": to_agent,
            "message": message,
            "complaint_id": state["complaint_id"],
            "state_snapshot": {
                "entities_count": len(state.get("entities", {})),
                "classification_available": bool(state.get("classification")),
                "risk_assessed": bool(state.get("risk_assessment")),
                "solution_generated": bool(state.get("solution")),
            },
        }

        self.agent_communication_log.append(communication_entry)

        # Add to conversation messages
        ai_message = AIMessage(content=f"🤖 {from_agent} → {to_agent}: {message}")
        state["messages"].append(ai_message)

        logger.info(f"Agent communication: {from_agent} → {to_agent}: {message}")

    async def _receive_agent_message(self, agent_name: str, state: ComplaintState):
        """Receive and process messages for an agent"""
        # Get messages for this agent
        agent_messages = [
            entry
            for entry in self.agent_communication_log
            if entry["to_agent"] == agent_name
            and entry["complaint_id"] == state["complaint_id"]
        ]

        if agent_messages:
            latest_message = agent_messages[-1]
            logger.info(f"Agent {agent_name} received: {latest_message['message']}")

            # Add received message to state
            received_message = AIMessage(
                content=f"📨 {agent_name} received: {latest_message['message']}"
            )
            state["messages"].append(received_message)

    def _log_agent_communication(
        self, agent_name: str, action: str, state: ComplaintState
    ):
        """Log agent communication for debugging"""
        logger.info(
            f"Agent {agent_name} {action} for complaint {state['complaint_id']}"
        )

    async def process_complaint(
        self, complaint_id: int, narrative: str, tenant_id: str, user_id: str
    ) -> ComplaintState:
        """Process complaint through the LangGraph workflow"""

        # Initialize state
        initial_state: ComplaintState = {
            "complaint_id": complaint_id,
            "tenant_id": tenant_id,
            "user_id": user_id,
            "narrative": narrative,
            "entities": {},
            "sentiment": {},
            "sentiment": {},
            "classification": {},
            "similar_complaints": [],
            "benchmarks": {},
            "risk_assessment": {},
            "solution": {},
            "feedback_analysis": {},
            "redacted_narrative": "",
            "pii_detected": False,
            "metadata": {},
            "messages": [HumanMessage(content=f"Process complaint: {narrative}")],
            "current_agent": "",
            "processing_steps": [],
            "errors": [],
        }

        try:
            # Execute the workflow
            logger.info(f"Starting LangGraph workflow for complaint {complaint_id}")

            # Clear communication log for this workflow
            self.agent_communication_log = []

            final_state: ComplaintState = await self.graph.ainvoke(initial_state)

            # Compile results
            result = {
                "complaint_id": complaint_id,
                "workflow_status": "completed",
                "total_execution_time": sum(
                    step["execution_time"] for step in final_state["processing_steps"]
                ),
                "agents_executed": len(final_state["processing_steps"]),
                "agent_communications": self.agent_communication_log,
                "errors": final_state.get("errors", []),
                "results": {
                    "redacted_narrative": final_state.get("redacted_narrative", ""),
                    "entities": final_state.get("entities", {}),
                    "classification": final_state.get("classification", {}),
                    "risk_assessment": final_state.get("risk_assessment", {}),
                    "similar_complaints": final_state.get("similar_complaints", []),
                    "benchmarks": final_state.get("benchmarks", {}),
                    "solution": final_state.get("solution", {}),
                    "feedback_analysis": final_state.get("feedback_analysis", {}),
                    "metadata": final_state.get("metadata", {}),
                },
                "processing_steps": final_state["processing_steps"],
                "conversation": [
                    {
                        "role": (
                            "human" if isinstance(msg, HumanMessage) else "assistant"
                        ),
                        "content": msg.content,
                    }
                    for msg in final_state["messages"]
                ],
            }

            logger.info(
                f"LangGraph workflow completed successfully for complaint {complaint_id}"
            )
            return final_state

        except Exception as e:
            logger.error(f"Error in LangGraph workflow: {e}")
            return {
                "complaint_id": complaint_id,
                "workflow_status": "failed",
                "error": str(e),
                "results": {},
                "processing_steps": [],
                "conversation": [],
            }


# Global instance
complaint_workflow_graph = ComplaintWorkflowGraph()
