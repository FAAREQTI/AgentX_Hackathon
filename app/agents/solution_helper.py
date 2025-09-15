import logging
import time
import json
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession

from langchain_core.messages import AIMessage

from app.services.llm import llm_service
from app.models.schemas import ComplaintState

logger = logging.getLogger(__name__)


class SolutionHelperAgent:
        
    def __init__(self):
        self.solution_templates = {
            "unauthorized_charges": "unauthorized_charge_template",
            "billing_dispute": "billing_dispute_template",
            "service_quality": "service_quality_template",
            "account_access": "account_access_template"
        }
        self.resolution_strategies = {
            "high_risk": ["immediate_refund", "escalation", "legal_review"],
            "medium_risk": ["investigation", "partial_refund", "service_credit"],
            "low_risk": ["explanation", "process_improvement", "follow_up"]
        }
    
    async def process(self, state: ComplaintState, db: AsyncSession = None) -> ComplaintState:
        """Process complaint through solution generation pipeline"""
        start_time = time.time()
        
        try:
            logger.info(f"Starting solution_helper for complaint {state['complaint_id']}")
            
            # Step 1: Analyze context for solution generation
            solution_context = self._build_solution_context(state)
            
            # Step 2: Generate primary solution using LLM
            primary_solution = await self._generate_primary_solution(state, solution_context)
            
            # Step 3: Generate alternative solutions
            alternative_solutions = await self._generate_alternative_solutions(state, solution_context)
            
            # Step 4: Create response letter
            response_letter = await self._generate_response_letter(state, primary_solution)
            
            # Step 5: Generate follow-up actions
            follow_up_actions = self._generate_follow_up_actions(state, primary_solution)
            
            # Step 6: Calculate solution confidence and success probability
            solution_metrics = self._calculate_solution_metrics(state, primary_solution)
            
            # Step 7: Create implementation timeline
            implementation_timeline = self._create_implementation_timeline(primary_solution, state)
            
            # Compile comprehensive solution
            comprehensive_solution = {
                "primary_solution": primary_solution,
                "alternative_solutions": alternative_solutions,
                "response_letter": response_letter,
                "follow_up_actions": follow_up_actions,
                "implementation_timeline": implementation_timeline,
                "solution_metrics": solution_metrics,
                "context_analysis": solution_context,
                "workflow_context": {
                    "processing_time": sum(step["execution_time"] for step in state["processing_steps"]),
                    "confidence_score": solution_metrics.get("confidence", 0.85),
                    "recommendation_basis": "Based on AI analysis, similar cases, and risk assessment",
                    "generated_at": time.time()
                }
            }
            
            # Update state
            state["solution"] = comprehensive_solution
            state["current_agent"] = "solution_helper"
            
            # Add processing step
            execution_time = time.time() - start_time
            step = {
                "agent": "solution_helper",
                "status": "success",
                "execution_time": execution_time,
                "output": {
                    "primary_strategy": primary_solution.get("resolution_strategy", "N/A"),
                    "alternatives_count": len(alternative_solutions),
                    "estimated_resolution_time": primary_solution.get("estimated_resolution_time", "N/A"),
                    "success_probability": solution_metrics.get("success_probability", 0.0),
                    "confidence": solution_metrics.get("confidence", 0.85)
                }
            }
            state["processing_steps"].append(step)
            
            # Add message
            message = AIMessage(
                content=f"💡 Solution Generated Successfully!\n"
                       f"🎯 Strategy: {primary_solution.get('resolution_strategy', 'Custom Resolution')}\n"
                       f"⏱️ Est. Time: {primary_solution.get('estimated_resolution_time', 'TBD')}\n"
                       f"📈 Success Rate: {solution_metrics.get('success_probability', 0.0):.1%}\n"
                       f"🔄 Alternatives: {len(alternative_solutions)} options available\n"
                       f"📝 Response Letter: Ready for review\n"
                       f"✅ Next Steps: {len(follow_up_actions)} actions identified"
            )
            state["messages"].append(message)
            
            logger.info(f"Solution helper completed in {execution_time:.2f}s")
            
        except Exception as e:
            logger.error(f"Error in solution_helper: {e}")
            state["errors"].append(f"solution_helper: {str(e)}")
            
            # Add failed step
            execution_time = time.time() - start_time
            step = {
                "agent": "solution_helper",
                "status": "failed",
                "execution_time": execution_time,
                "error": str(e)
            }
            state["processing_steps"].append(step)
            
        return state
    
    def _build_solution_context(self, state: ComplaintState) -> Dict[str, Any]:
        """Build comprehensive context for solution generation"""
        try:
            context = {
                "complaint_summary": {
                    "narrative": state["narrative"],
                    "entities": state.get("entities", {}),
                    "classification": state.get("classification", {}),
                    "sentiment": state.get("sentiment", {})
                },
                "risk_profile": {
                    "risk_score": state.get("risk_assessment", {}).get("risk_score", 0.5),
                    "risk_category": state.get("risk_assessment", {}).get("risk_category", "medium"),
                    "escalation_probability": state.get("risk_assessment", {}).get("escalation_probability", 0.5),
                    "mitigation_strategies": state.get("risk_assessment", {}).get("mitigation_strategies", [])
                },
                "historical_context": {
                    "similar_complaints": state.get("similar_complaints", []),
                    "success_patterns": state.get("benchmarks", {}).get("success_patterns", {}),
                    "industry_benchmarks": state.get("benchmarks", {}).get("industry_comparisons", {})
                },
                "customer_profile": {
                    "tenant_id": state["tenant_id"],
                    "user_id": state.get("user_id"),
                    "complaint_history": self._extract_customer_history(state),
                    "value_segment": self._determine_customer_segment(state)
                },
                "regulatory_considerations": {
                    "flags": state.get("classification", {}).get("regulatory_flags", []),
                    "compliance_requirements": self._identify_compliance_requirements(state),
                    "documentation_needs": self._identify_documentation_needs(state)
                }
            }
            
            return context
            
        except Exception as e:
            logger.error(f"Error building solution context: {e}")
            return {"error": str(e)}
    
    async def _generate_primary_solution(
        self, 
        state: ComplaintState, 
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate the primary recommended solution"""
        try:
            # Use LLM service for solution generation
            llm_solution = await llm_service.generate_solution(
                narrative=state["narrative"],
                entities=state.get("entities", {}),
                classification=state.get("classification", {}),
                similar_cases=state.get("similar_complaints", []),
                risk_assessment=state.get("risk_assessment", {})
            )
            
            # Enhance with context-aware improvements
            enhanced_solution = self._enhance_solution_with_context(llm_solution, context, state)
            
            return enhanced_solution
            
        except Exception as e:
            logger.error(f"Error generating primary solution: {e}")
            return self._get_fallback_solution(state)
    
    async def _generate_alternative_solutions(
        self, 
        state: ComplaintState, 
        context: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate alternative solution options"""
        try:
            alternatives = []
            risk_category = state.get("risk_assessment", {}).get("risk_category", "medium")
            issue_category = state.get("classification", {}).get("issue_category", "other")
            
            # Risk-based alternatives
            risk_strategies = self.resolution_strategies.get(f"{risk_category}_risk", ["standard_process"])
            
            for strategy in risk_strategies[:3]:  # Top 3 alternatives
                alternative = {
                    "strategy_name": strategy,
                    "description": self._get_strategy_description(strategy),
                    "estimated_time": self._estimate_strategy_time(strategy),
                    "success_rate": self._get_strategy_success_rate(strategy, context),
                    "resource_requirements": self._get_strategy_resources(strategy),
                    "customer_impact": self._assess_customer_impact(strategy),
                    "cost_implications": self._assess_cost_implications(strategy)
                }
                alternatives.append(alternative)
            
            # Issue-specific alternatives
            if issue_category in self.solution_templates:
                template_alternatives = self._get_template_alternatives(issue_category)
                alternatives.extend(template_alternatives)
            
            # Remove duplicates and sort by success rate
            unique_alternatives = []
            seen_strategies = set()
            
            for alt in alternatives:
                if alt["strategy_name"] not in seen_strategies:
                    unique_alternatives.append(alt)
                    seen_strategies.add(alt["strategy_name"])
            
            # Sort by success rate
            unique_alternatives.sort(key=lambda x: x["success_rate"], reverse=True)
            
            return unique_alternatives[:5]  # Top 5 alternatives
            
        except Exception as e:
            logger.error(f"Error generating alternative solutions: {e}")
            return []
    
    async def _generate_response_letter(
        self, 
        state: ComplaintState, 
        solution: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate professional response letter"""
        try:
            # Extract key information
            customer_name = state.get("entities", {}).get("customer_name", "[Customer Name]")
            complaint_id = state["complaint_id"]
            issue_type = state.get("classification", {}).get("issue_category", "complaint")
            resolution_strategy = solution.get("resolution_strategy", "investigation")
            
            # Generate letter content using LLM
            letter_content = solution.get("response_letter", "")
            
            if not letter_content:
                # Fallback letter generation
                letter_content = self._generate_fallback_letter(state, solution)
            
            # Enhance letter with personalization
            personalized_letter = self._personalize_letter(letter_content, state, solution)
            
            # Generate letter metadata
            letter_metadata = {
                "letter_type": "resolution_response",
                "tone": self._determine_letter_tone(state),
                "urgency": state.get("classification", {}).get("urgency_level", "medium"),
                "compliance_reviewed": True,
                "personalization_level": "high",
                "estimated_reading_time": len(personalized_letter.split()) // 200,  # minutes
                "language": "en",
                "format_options": ["text", "html", "pdf"]
            }
            
            return {
                "content": personalized_letter,
                "metadata": letter_metadata,
                "subject_line": self._generate_subject_line(state, solution),
                "key_points": self._extract_key_points(personalized_letter),
                "call_to_action": self._generate_call_to_action(solution),
                "follow_up_date": self._calculate_follow_up_date(solution)
            }
            
        except Exception as e:
            logger.error(f"Error generating response letter: {e}")
            return {"content": "Response letter generation failed", "error": str(e)}
    
    def _generate_follow_up_actions(
        self, 
        state: ComplaintState, 
        solution: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate follow-up actions for complaint resolution"""
        try:
            actions = []
            risk_category = state.get("risk_assessment", {}).get("risk_category", "medium")
            
            # Standard follow-up actions
            actions.extend([
                {
                    "action": "send_response_letter",
                    "description": "Send generated response letter to customer",
                    "priority": "high",
                    "due_date": self._calculate_due_date(hours=2),
                    "assigned_to": "customer_service_rep",
                    "estimated_duration": "15 minutes",
                    "dependencies": []
                },
                {
                    "action": "update_complaint_status",
                    "description": "Update complaint status in system",
                    "priority": "medium",
                    "due_date": self._calculate_due_date(hours=1),
                    "assigned_to": "system_admin",
                    "estimated_duration": "5 minutes",
                    "dependencies": ["send_response_letter"]
                }
            ])
            
            # Risk-based actions
            if risk_category == "high":
                actions.extend([
                    {
                        "action": "supervisor_review",
                        "description": "Have supervisor review resolution approach",
                        "priority": "critical",
                        "due_date": self._calculate_due_date(hours=4),
                        "assigned_to": "supervisor",
                        "estimated_duration": "30 minutes",
                        "dependencies": []
                    },
                    {
                        "action": "customer_callback",
                        "description": "Schedule follow-up call with customer",
                        "priority": "high",
                        "due_date": self._calculate_due_date(days=1),
                        "assigned_to": "senior_rep",
                        "estimated_duration": "20 minutes",
                        "dependencies": ["send_response_letter"]
                    }
                ])
            
            # Solution-specific actions
            resolution_strategy = solution.get("resolution_strategy", "")
            if "refund" in resolution_strategy.lower():
                actions.append({
                    "action": "process_refund",
                    "description": "Process customer refund as per resolution",
                    "priority": "high",
                    "due_date": self._calculate_due_date(hours=24),
                    "assigned_to": "finance_team",
                    "estimated_duration": "45 minutes",
                    "dependencies": ["supervisor_review"]
                })
            
            if "investigation" in resolution_strategy.lower():
                actions.append({
                    "action": "conduct_investigation",
                    "description": "Investigate complaint details thoroughly",
                    "priority": "medium",
                    "due_date": self._calculate_due_date(days=3),
                    "assigned_to": "investigation_team",
                    "estimated_duration": "2 hours",
                    "dependencies": []
                })
            
            # Compliance actions
            regulatory_flags = state.get("classification", {}).get("regulatory_flags", [])
            if regulatory_flags:
                actions.append({
                    "action": "compliance_documentation",
                    "description": "Document complaint for regulatory compliance",
                    "priority": "medium",
                    "due_date": self._calculate_due_date(days=7),
                    "assigned_to": "compliance_team",
                    "estimated_duration": "30 minutes",
                    "dependencies": ["update_complaint_status"]
                })
            
            return actions
            
        except Exception as e:
            logger.error(f"Error generating follow-up actions: {e}")
            return []
    
    def _calculate_solution_metrics(
        self, 
        state: ComplaintState, 
        solution: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate solution confidence and success metrics"""
        try:
            # Base confidence from solution quality
            base_confidence = 0.75
            
            # Adjust based on available data
            if state.get("similar_complaints"):
                base_confidence += 0.10
            
            if state.get("risk_assessment", {}).get("confidence", 0) > 0.8:
                base_confidence += 0.05
            
            if state.get("classification", {}).get("confidence_score", 0) > 0.8:
                base_confidence += 0.05
            
            # Calculate success probability based on similar cases
            similar_complaints = state.get("similar_complaints", [])
            if similar_complaints:
                successful_cases = [
                    c for c in similar_complaints 
                    if c.get("customer_satisfaction", 0) >= 4
                ]
                success_probability = len(successful_cases) / len(similar_complaints)
            else:
                success_probability = 0.75  # Default
            
            # Adjust for risk level
            risk_category = state.get("risk_assessment", {}).get("risk_category", "medium")
            risk_adjustments = {"low": 0.1, "medium": 0.0, "high": -0.1, "critical": -0.2}
            success_probability += risk_adjustments.get(risk_category, 0.0)
            
            # Calculate estimated resolution time
            estimated_hours = self._estimate_resolution_time(state, solution)
            
            return {
                "confidence": min(base_confidence, 1.0),
                "success_probability": max(min(success_probability, 0.95), 0.05),
                "estimated_resolution_hours": estimated_hours,
                "complexity_score": self._calculate_solution_complexity(solution),
                "resource_intensity": self._calculate_resource_intensity(solution),
                "customer_satisfaction_prediction": self._predict_customer_satisfaction(state, solution)
            }
            
        except Exception as e:
            logger.error(f"Error calculating solution metrics: {e}")
            return {"confidence": 0.5, "success_probability": 0.5}
    
    def _create_implementation_timeline(
        self, 
        solution: Dict[str, Any], 
        state: ComplaintState
    ) -> Dict[str, Any]:
        """Create implementation timeline for solution"""
        try:
            timeline_phases = []
            
            # Phase 1: Immediate Response
            timeline_phases.append({
                "phase": "immediate_response",
                "description": "Send acknowledgment and initial response",
                "start_time": "0 hours",
                "duration": "2 hours",
                "milestones": [
                    "Send response letter",
                    "Update complaint status",
                    "Notify relevant teams"
                ],
                "success_criteria": ["Customer receives response", "Status updated in system"]
            })
            
            # Phase 2: Investigation/Processing
            resolution_strategy = solution.get("resolution_strategy", "")
            if "investigation" in resolution_strategy.lower():
                timeline_phases.append({
                    "phase": "investigation",
                    "description": "Conduct thorough investigation",
                    "start_time": "2 hours",
                    "duration": "48 hours",
                    "milestones": [
                        "Gather relevant documentation",
                        "Interview involved parties",
                        "Analyze findings"
                    ],
                    "success_criteria": ["Investigation completed", "Findings documented"]
                })
            
            # Phase 3: Resolution Implementation
            timeline_phases.append({
                "phase": "resolution",
                "description": "Implement agreed resolution",
                "start_time": "24 hours",
                "duration": "24 hours",
                "milestones": [
                    "Execute resolution actions",
                    "Process any refunds/credits",
                    "Update customer records"
                ],
                "success_criteria": ["Resolution implemented", "Customer notified"]
            })
            
            # Phase 4: Follow-up
            timeline_phases.append({
                "phase": "follow_up",
                "description": "Follow up with customer",
                "start_time": "72 hours",
                "duration": "24 hours",
                "milestones": [
                    "Contact customer for feedback",
                    "Ensure satisfaction",
                    "Close complaint if resolved"
                ],
                "success_criteria": ["Customer satisfied", "Complaint closed"]
            })
            
            return {
                "phases": timeline_phases,
                "total_estimated_time": "96 hours",
                "critical_path": ["immediate_response", "resolution", "follow_up"],
                "risk_factors": self._identify_timeline_risks(state),
                "contingency_plans": self._create_contingency_plans(state)
            }
            
        except Exception as e:
            logger.error(f"Error creating implementation timeline: {e}")
            return {"error": str(e)}
    
    # Helper methods
    def _enhance_solution_with_context(
        self, 
        base_solution: Dict[str, Any], 
        context: Dict[str, Any], 
        state: ComplaintState
    ) -> Dict[str, Any]:
        """Enhance base solution with contextual information"""
        enhanced = base_solution.copy()
        
        # Add risk-aware adjustments
        risk_score = context.get("risk_profile", {}).get("risk_score", 0.5)
        if risk_score > 0.7:
            enhanced["urgency_level"] = "high"
            enhanced["escalation_required"] = True
        
        # Add customer segment considerations
        customer_segment = context.get("customer_profile", {}).get("value_segment", "standard")
        if customer_segment == "premium":
            enhanced["service_level"] = "premium"
            enhanced["response_time_target"] = "1 hour"
        
        return enhanced
    
    def _extract_customer_history(self, state: ComplaintState) -> Dict[str, Any]:
        """Extract customer history from state"""
        return {
            "previous_complaints": 0,  # Would query database
            "satisfaction_history": [],
            "account_tenure": "unknown"
        }
    
    def _determine_customer_segment(self, state: ComplaintState) -> str:
        """Determine customer value segment"""
        # Mock implementation - would use actual customer data
        return "standard"
    
    def _identify_compliance_requirements(self, state: ComplaintState) -> List[str]:
        """Identify compliance requirements"""
        requirements = []
        regulatory_flags = state.get("classification", {}).get("regulatory_flags", [])
        
        for flag in regulatory_flags:
            if flag == "fair_credit_reporting":
                requirements.append("FCRA documentation required")
            elif flag == "truth_in_lending":
                requirements.append("TILA disclosure needed")
        
        return requirements
    
    def _identify_documentation_needs(self, state: ComplaintState) -> List[str]:
        """Identify documentation needs"""
        return ["complaint_record", "resolution_documentation", "customer_communication_log"]
    
    def _get_fallback_solution(self, state: ComplaintState) -> Dict[str, Any]:
        """Get fallback solution when generation fails"""
        return {
            "resolution_strategy": "Standard Investigation and Response",
            "estimated_resolution_time": "48 hours",
            "response_letter": "We will investigate your complaint and respond within 48 hours.",
            "next_steps": ["Investigate complaint", "Contact customer", "Provide resolution"]
        }
    
    def _get_strategy_description(self, strategy: str) -> str:
        """Get description for resolution strategy"""
        descriptions = {
            "immediate_refund": "Process full refund immediately",
            "investigation": "Conduct thorough investigation before resolution",
            "escalation": "Escalate to senior management",
            "partial_refund": "Provide partial refund with explanation",
            "service_credit": "Offer service credit as compensation",
            "explanation": "Provide detailed explanation of situation"
        }
        return descriptions.get(strategy, "Standard resolution process")
    
    def _estimate_strategy_time(self, strategy: str) -> str:
        """Estimate time for strategy implementation"""
        time_estimates = {
            "immediate_refund": "2-4 hours",
            "investigation": "2-5 days",
            "escalation": "4-8 hours",
            "partial_refund": "4-8 hours",
            "service_credit": "2-4 hours",
            "explanation": "1-2 hours"
        }
        return time_estimates.get(strategy, "24-48 hours")
    
    def _get_strategy_success_rate(self, strategy: str, context: Dict[str, Any]) -> float:
        """Get success rate for strategy"""
        base_rates = {
            "immediate_refund": 0.90,
            "investigation": 0.75,
            "escalation": 0.85,
            "partial_refund": 0.70,
            "service_credit": 0.80,
            "explanation": 0.60
        }
        return base_rates.get(strategy, 0.70)
    
    def _get_strategy_resources(self, strategy: str) -> List[str]:
        """Get resource requirements for strategy"""
        resources = {
            "immediate_refund": ["finance_team", "customer_service"],
            "investigation": ["investigation_team", "documentation"],
            "escalation": ["senior_management", "legal_review"],
            "partial_refund": ["finance_team", "approval_workflow"],
            "service_credit": ["billing_system", "customer_service"],
            "explanation": ["subject_matter_expert", "documentation"]
        }
        return resources.get(strategy, ["customer_service"])
    
    def _assess_customer_impact(self, strategy: str) -> str:
        """Assess customer impact of strategy"""
        impacts = {
            "immediate_refund": "high_positive",
            "investigation": "neutral",
            "escalation": "mixed",
            "partial_refund": "moderate_positive",
            "service_credit": "moderate_positive",
            "explanation": "low_positive"
        }
        return impacts.get(strategy, "neutral")
    
    def _assess_cost_implications(self, strategy: str) -> str:
        """Assess cost implications of strategy"""
        costs = {
            "immediate_refund": "high",
            "investigation": "medium",
            "escalation": "low",
            "partial_refund": "medium",
            "service_credit": "medium",
            "explanation": "low"
        }
        return costs.get(strategy, "medium")
    
    def _get_template_alternatives(self, issue_category: str) -> List[Dict[str, Any]]:
        """Get template-based alternatives for issue category"""
        # Mock implementation
        return []
    
    def _generate_fallback_letter(self, state: ComplaintState, solution: Dict[str, Any]) -> str:
        """Generate fallback letter when LLM generation fails"""
        return f"""
Dear Valued Customer,

Thank you for bringing your concern to our attention. We take all customer feedback seriously and are committed to resolving your issue promptly.

We have reviewed your complaint and will {solution.get('resolution_strategy', 'investigate the matter thoroughly')}.

We will contact you within {solution.get('estimated_resolution_time', '48 hours')} with an update on our progress.

Thank you for your patience.

Sincerely,
Customer Service Team
        """.strip()
    
    def _personalize_letter(self, letter_content: str, state: ComplaintState, solution: Dict[str, Any]) -> str:
        """Personalize letter content"""
        # Basic personalization - would be more sophisticated in production
        personalized = letter_content
        
        # Replace placeholders
        personalized = personalized.replace("[Customer Name]", "Valued Customer")
        personalized = personalized.replace("[Complaint ID]", str(state["complaint_id"]))
        
        return personalized
    
    def _determine_letter_tone(self, state: ComplaintState) -> str:
        """Determine appropriate tone for letter"""
        risk_category = state.get("risk_assessment", {}).get("risk_category", "medium")
        sentiment = state.get("sentiment", {}).get("emotion", "neutral")
        
        if risk_category == "high" or sentiment == "angry":
            return "empathetic_formal"
        elif sentiment == "frustrated":
            return "understanding_professional"
        else:
            return "professional_friendly"
    
    def _generate_subject_line(self, state: ComplaintState, solution: Dict[str, Any]) -> str:
        """Generate email subject line"""
        complaint_id = state["complaint_id"]
        issue_type = state.get("classification", {}).get("issue_category", "complaint")
        
        return f"Re: Your {issue_type.replace('_', ' ').title()} - Complaint #{complaint_id}"
    
    def _extract_key_points(self, letter_content: str) -> List[str]:
        """Extract key points from letter"""
        # Simple extraction - would use NLP in production
        sentences = letter_content.split('.')
        key_points = [s.strip() for s in sentences if len(s.strip()) > 20][:3]
        return key_points
    
    def _generate_call_to_action(self, solution: Dict[str, Any]) -> str:
        """Generate call to action"""
        return "Please contact us if you have any questions or concerns about this resolution."
    
    def _calculate_follow_up_date(self, solution: Dict[str, Any]) -> str:
        """Calculate follow-up date"""
        from datetime import datetime, timedelta
        follow_up_date = datetime.now() + timedelta(days=7)
        return follow_up_date.isoformat()
    
    def _calculate_due_date(self, hours: int = 0, days: int = 0) -> str:
        """Calculate due date for actions"""
        from datetime import datetime, timedelta
        due_date = datetime.now() + timedelta(hours=hours, days=days)
        return due_date.isoformat()
    
    def _estimate_resolution_time(self, state: ComplaintState, solution: Dict[str, Any]) -> float:
        """Estimate resolution time in hours"""
        base_time = 24.0  # Base 24 hours
        
        # Adjust for complexity
        complexity = state.get("metadata", {}).get("complexity_score", 0.5)
        base_time *= (1 + complexity)
        
        # Adjust for risk
        risk_score = state.get("risk_assessment", {}).get("risk_score", 0.5)
        if risk_score > 0.7:
            base_time *= 1.5
        
        return base_time
    
    def _calculate_solution_complexity(self, solution: Dict[str, Any]) -> float:
        """Calculate solution complexity score"""
        complexity = 0.5  # Base complexity
        
        # Adjust based on solution elements
        if solution.get("next_steps"):
            complexity += len(solution["next_steps"]) * 0.1
        
        return min(complexity, 1.0)
    
    def _calculate_resource_intensity(self, solution: Dict[str, Any]) -> str:
        """Calculate resource intensity"""
        strategy = solution.get("resolution_strategy", "")
        
        if "investigation" in strategy.lower():
            return "high"
        elif "refund" in strategy.lower():
            return "medium"
        else:
            return "low"
    
    def _predict_customer_satisfaction(self, state: ComplaintState, solution: Dict[str, Any]) -> float:
        """Predict customer satisfaction with solution"""
        base_satisfaction = 0.75
        
        # Adjust for risk mitigation
        risk_score = state.get("risk_assessment", {}).get("risk_score", 0.5)
        if risk_score > 0.7:
            base_satisfaction -= 0.1
        
        # Adjust for solution quality
        if "refund" in solution.get("resolution_strategy", "").lower():
            base_satisfaction += 0.15
        
        return min(base_satisfaction, 0.95)
    
    def _identify_timeline_risks(self, state: ComplaintState) -> List[str]:
        """Identify risks to timeline"""
        risks = []
        
        if state.get("risk_assessment", {}).get("risk_category") == "high":
            risks.append("High-risk complaint may require additional approvals")
        
        if state.get("classification", {}).get("regulatory_flags"):
            risks.append("Regulatory compliance may extend timeline")
        
        return risks
    
    def _create_contingency_plans(self, state: ComplaintState) -> List[Dict[str, str]]:
        """Create contingency plans"""
        return [
            {
                "scenario": "Customer escalation",
                "action": "Immediate supervisor involvement and expedited resolution"
            },
            {
                "scenario": "Additional information needed",
                "action": "Contact customer within 4 hours for clarification"
            }
        ]


# Global instance
solution_helper_agent = SolutionHelperAgent()