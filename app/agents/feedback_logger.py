import logging
import time
import json
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from langchain_core.messages import AIMessage

from app.models.schemas import ComplaintState

logger = logging.getLogger(__name__)


class FeedbackLoggerAgent:

    def __init__(self):
        self.learning_metrics = {
            "accuracy_threshold": 0.85,
            "confidence_threshold": 0.80,
            "feedback_weight": 0.3,
        }
        self.audit_categories = [
            "workflow_performance",
            "prediction_accuracy",
            "customer_satisfaction",
            "resolution_effectiveness",
        ]

    async def process(
        self, state: ComplaintState, db: AsyncSession = None
    ) -> ComplaintState:
        """Process complaint through feedback logging and learning pipeline"""
        start_time = time.time()

        try:
            logger.info(
                f"Starting feedback_logger for complaint {state['complaint_id']}"
            )

            # Step 1: Calculate workflow performance metrics
            workflow_metrics = self._calculate_workflow_metrics(state)

            # Step 2: Create comprehensive audit log
            audit_log = await self._create_audit_log(state, workflow_metrics, db)

            # Step 3: Identify learning opportunities
            learning_insights = self._identify_learning_opportunities(
                state, workflow_metrics
            )

            # Step 4: Generate feedback collection strategy
            feedback_strategy = self._generate_feedback_strategy(state)

            # Step 5: Create performance benchmarks
            performance_benchmarks = self._create_performance_benchmarks(
                state, workflow_metrics
            )

            # Step 6: Setup continuous monitoring
            monitoring_config = self._setup_continuous_monitoring(state)

            # Step 7: Generate improvement recommendations
            improvement_recommendations = self._generate_improvement_recommendations(
                state, workflow_metrics, learning_insights
            )

            # Compile comprehensive feedback analysis
            comprehensive_feedback = {
                "workflow_metrics": workflow_metrics,
                "audit_log": audit_log,
                "learning_insights": learning_insights,
                "feedback_strategy": feedback_strategy,
                "performance_benchmarks": performance_benchmarks,
                "monitoring_config": monitoring_config,
                "improvement_recommendations": improvement_recommendations,
                "completion_summary": {
                    "total_processing_time": sum(
                        step["execution_time"] for step in state["processing_steps"]
                    ),
                    "agents_executed": len(state["processing_steps"]),
                    "success_rate": len(
                        [
                            s
                            for s in state["processing_steps"]
                            if s["status"] == "success"
                        ]
                    )
                    / len(state["processing_steps"]),
                    "errors_encountered": len(state.get("errors", [])),
                    "confidence_score": self._calculate_overall_confidence(state),
                    "ready_for_feedback": True,
                    "completion_timestamp": time.time(),
                },
            }

            # Update state
            state["feedback_analysis"] = comprehensive_feedback
            state["current_agent"] = "feedback_logger"

            # Add processing step
            execution_time = time.time() - start_time
            step = {
                "agent": "feedback_logger",
                "status": "success",
                "execution_time": execution_time,
                "output": {
                    "workflow_success_rate": workflow_metrics.get("success_rate", 0.0),
                    "overall_confidence": comprehensive_feedback["completion_summary"][
                        "confidence_score"
                    ],
                    "learning_opportunities": len(
                        learning_insights.get("opportunities", [])
                    ),
                    "audit_entries": len(audit_log.get("entries", [])),
                    "ready_for_feedback": True,
                },
            }
            state["processing_steps"].append(step)

            # Add final message
            total_time = sum(
                step["execution_time"] for step in state["processing_steps"]
            )
            message = AIMessage(
                content=f"🎯 Workflow Completed Successfully!\n"
                f"⏱️ Total Processing Time: {total_time:.2f}s\n"
                f"🤖 Agents Executed: {len(state['processing_steps'])}\n"
                f"✅ Success Rate: {comprehensive_feedback['completion_summary']['success_rate']:.1%}\n"
                f"📊 Confidence Score: {comprehensive_feedback['completion_summary']['confidence_score']:.1%}\n"
                f"🔍 Learning Opportunities: {len(learning_insights.get('opportunities', []))}\n"
                f"📝 Ready for User Feedback: Yes\n"
                f"🚀 Next Steps: Await customer feedback for continuous improvement"
            )
            state["messages"].append(message)

            logger.info(f"Feedback logger completed in {execution_time:.2f}s")
            logger.info(
                f"Full workflow completed for complaint {state['complaint_id']} in {total_time:.2f}s"
            )

        except Exception as e:
            logger.error(f"Error in feedback_logger: {e}")
            state["errors"].append(f"feedback_logger: {str(e)}")

            # Add failed step
            execution_time = time.time() - start_time
            step = {
                "agent": "feedback_logger",
                "status": "failed",
                "execution_time": execution_time,
                "error": str(e),
            }
            state["processing_steps"].append(step)

        return state

    def _calculate_workflow_metrics(self, state: ComplaintState) -> Dict[str, Any]:
        """Calculate comprehensive workflow performance metrics"""
        try:
            processing_steps = state.get("processing_steps", [])

            if not processing_steps:
                return {"error": "No processing steps found"}

            # Basic metrics
            total_time = sum(step["execution_time"] for step in processing_steps)
            successful_steps = [
                step for step in processing_steps if step["status"] == "success"
            ]
            failed_steps = [
                step for step in processing_steps if step["status"] == "failed"
            ]

            success_rate = len(successful_steps) / len(processing_steps)

            # Agent-specific metrics
            agent_metrics = {}
            for step in processing_steps:
                agent_name = step["agent"]
                agent_metrics[agent_name] = {
                    "execution_time": step["execution_time"],
                    "status": step["status"],
                    "output_quality": self._assess_output_quality(step, state),
                    "confidence": step.get("output", {}).get("confidence", 0.85),
                }

            # Quality metrics
            quality_metrics = {
                "entity_extraction_quality": self._assess_entity_quality(state),
                "classification_accuracy": self._assess_classification_accuracy(state),
                "risk_prediction_confidence": self._assess_risk_confidence(state),
                "solution_relevance": self._assess_solution_relevance(state),
                "overall_coherence": self._assess_overall_coherence(state),
            }

            # Performance benchmarks
            performance_benchmarks = {
                "speed_percentile": self._calculate_speed_percentile(total_time),
                "accuracy_percentile": self._calculate_accuracy_percentile(
                    quality_metrics
                ),
                "efficiency_score": self._calculate_efficiency_score(
                    total_time, success_rate
                ),
                "complexity_handling": self._assess_complexity_handling(state),
            }

            return {
                "total_execution_time": total_time,
                "success_rate": success_rate,
                "failed_steps_count": len(failed_steps),
                "agent_metrics": agent_metrics,
                "quality_metrics": quality_metrics,
                "performance_benchmarks": performance_benchmarks,
                "workflow_efficiency": total_time / len(processing_steps),
                "error_rate": len(state.get("errors", [])) / len(processing_steps),
                "completion_status": (
                    "success" if success_rate > 0.8 else "partial_success"
                ),
            }

        except Exception as e:
            logger.error(f"Error calculating workflow metrics: {e}")
            return {"error": str(e)}

    async def _create_audit_log(
        self, state: ComplaintState, metrics: Dict[str, Any], db: AsyncSession
    ) -> Dict[str, Any]:
        """Create comprehensive audit log for compliance and learning"""
        try:
            audit_entries = []

            # Workflow execution audit
            audit_entries.append(
                {
                    "category": "workflow_execution",
                    "timestamp": time.time(),
                    "details": {
                        "complaint_id": state["complaint_id"],
                        "tenant_id": state["tenant_id"],
                        "user_id": state.get("user_id"),
                        "total_execution_time": metrics.get("total_execution_time", 0),
                        "success_rate": metrics.get("success_rate", 0),
                        "agents_executed": len(state.get("processing_steps", [])),
                        "errors_encountered": state.get("errors", []),
                    },
                }
            )

            # Agent performance audit
            for step in state.get("processing_steps", []):
                audit_entries.append(
                    {
                        "category": "agent_performance",
                        "timestamp": time.time(),
                        "details": {
                            "agent_name": step["agent"],
                            "execution_time": step["execution_time"],
                            "status": step["status"],
                            "output_summary": step.get("output", {}),
                            "error": step.get("error"),
                        },
                    }
                )

            # Data processing audit
            audit_entries.append(
                {
                    "category": "data_processing",
                    "timestamp": time.time(),
                    "details": {
                        "narrative_length": len(state["narrative"]),
                        "entities_extracted": len(state.get("entities", {})),
                        "pii_detected": state.get("pii_detected", False),
                        "classification_confidence": state.get(
                            "classification", {}
                        ).get("confidence_score", 0),
                        "risk_score": state.get("risk_assessment", {}).get(
                            "risk_score", 0
                        ),
                        "solution_generated": bool(state.get("solution")),
                    },
                }
            )

            # Compliance audit
            regulatory_flags = state.get("classification", {}).get(
                "regulatory_flags", []
            )
            if regulatory_flags:
                audit_entries.append(
                    {
                        "category": "compliance",
                        "timestamp": time.time(),
                        "details": {
                            "regulatory_flags": regulatory_flags,
                            "compliance_requirements": state.get("solution", {})
                            .get("context_analysis", {})
                            .get("regulatory_considerations", {}),
                            "documentation_complete": True,
                            "audit_trail_maintained": True,
                        },
                    }
                )

            # Store audit log in database if available
            if db:
                try:
                    audit_query = text(
                        """
                        INSERT INTO audit_logs (tenant_id, user_id, action, payload, created_at)
                        VALUES (:tenant_id, :user_id, :action, :payload, NOW())
                    """
                    )

                    await db.execute(
                        audit_query,
                        {
                            "tenant_id": state["tenant_id"],
                            "user_id": state.get("user_id"),
                            "action": "workflow_completion",
                            "payload": json.dumps(
                                {
                                    "complaint_id": state["complaint_id"],
                                    "metrics": metrics,
                                    "audit_entries": audit_entries,
                                }
                            ),
                        },
                    )
                    await db.commit()

                except Exception as e:
                    logger.error(f"Error storing audit log: {e}")

            return {
                "entries": audit_entries,
                "total_entries": len(audit_entries),
                "categories": list(set(entry["category"] for entry in audit_entries)),
                "compliance_status": "compliant",
                "audit_timestamp": time.time(),
            }

        except Exception as e:
            logger.error(f"Error creating audit log: {e}")
            return {"error": str(e)}

    def _identify_learning_opportunities(
        self, state: ComplaintState, metrics: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Identify opportunities for model improvement and learning"""
        try:
            opportunities = []
            insights = []

            # Low confidence predictions
            risk_confidence = state.get("risk_assessment", {}).get("confidence", 1.0)
            if risk_confidence < self.learning_metrics["confidence_threshold"]:
                opportunities.append(
                    {
                        "type": "risk_model_improvement",
                        "description": "Risk prediction confidence below threshold",
                        "current_confidence": risk_confidence,
                        "target_confidence": self.learning_metrics[
                            "confidence_threshold"
                        ],
                        "suggested_action": "Collect more training data for similar complaint types",
                    }
                )

            # Classification accuracy
            classification_confidence = state.get("classification", {}).get(
                "confidence_score", 1.0
            )
            if (
                classification_confidence
                < self.learning_metrics["confidence_threshold"]
            ):
                opportunities.append(
                    {
                        "type": "classification_improvement",
                        "description": "Classification confidence below threshold",
                        "current_confidence": classification_confidence,
                        "suggested_action": "Review and improve classification training data",
                    }
                )

            # Workflow efficiency
            total_time = metrics.get("total_execution_time", 0)
            if total_time > 30:  # seconds
                opportunities.append(
                    {
                        "type": "performance_optimization",
                        "description": "Workflow execution time above optimal range",
                        "current_time": total_time,
                        "target_time": 20,
                        "suggested_action": "Optimize agent processing and database queries",
                    }
                )

            # Error analysis
            errors = state.get("errors", [])
            if errors:
                opportunities.append(
                    {
                        "type": "error_reduction",
                        "description": "Errors encountered during processing",
                        "error_count": len(errors),
                        "errors": errors,
                        "suggested_action": "Implement better error handling and validation",
                    }
                )

            # Generate insights
            insights.extend(
                [
                    f"Workflow completed with {metrics.get('success_rate', 0):.1%} success rate",
                    f"Total processing time: {total_time:.2f}s",
                    f"Risk assessment confidence: {risk_confidence:.2f}",
                    f"Classification confidence: {classification_confidence:.2f}",
                ]
            )

            # Pattern analysis
            complaint_type = state.get("classification", {}).get(
                "issue_category", "unknown"
            )
            risk_category = state.get("risk_assessment", {}).get(
                "risk_category", "medium"
            )

            insights.append(
                f"Complaint pattern: {complaint_type} with {risk_category} risk"
            )

            return {
                "opportunities": opportunities,
                "insights": insights,
                "learning_priority": "high" if len(opportunities) > 2 else "medium",
                "feedback_importance": self._calculate_feedback_importance(
                    opportunities
                ),
                "model_update_recommended": len(opportunities) > 1,
            }

        except Exception as e:
            logger.error(f"Error identifying learning opportunities: {e}")
            return {"error": str(e)}

    def _generate_feedback_strategy(self, state: ComplaintState) -> Dict[str, Any]:
        """Generate strategy for collecting user feedback"""
        try:
            risk_category = state.get("risk_assessment", {}).get(
                "risk_category", "medium"
            )
            solution_confidence = (
                state.get("solution", {})
                .get("solution_metrics", {})
                .get("confidence", 0.85)
            )

            # Determine feedback priority
            if risk_category == "high" or solution_confidence < 0.7:
                feedback_priority = "critical"
                feedback_timeline = "immediate"
            elif risk_category == "medium":
                feedback_priority = "high"
                feedback_timeline = "within_24_hours"
            else:
                feedback_priority = "standard"
                feedback_timeline = "within_week"

            # Feedback collection methods
            collection_methods = []

            # Always include basic rating
            collection_methods.append(
                {
                    "method": "rating_scale",
                    "description": "1-5 star rating for overall satisfaction",
                    "timing": "immediate",
                    "required": True,
                }
            )

            # Add detailed feedback for high-risk cases
            if risk_category in ["high", "critical"]:
                collection_methods.extend(
                    [
                        {
                            "method": "detailed_survey",
                            "description": "Comprehensive feedback survey",
                            "timing": "after_resolution",
                            "required": True,
                        },
                        {
                            "method": "follow_up_call",
                            "description": "Personal follow-up call",
                            "timing": "within_48_hours",
                            "required": False,
                        },
                    ]
                )

            # Specific feedback questions
            feedback_questions = [
                "How satisfied are you with the resolution provided?",
                "Was the response time acceptable?",
                "Did the solution address your concerns?",
                "How would you rate the communication quality?",
            ]

            # Add risk-specific questions
            if risk_category == "high":
                feedback_questions.extend(
                    [
                        "Do you feel your concerns were taken seriously?",
                        "Would you recommend our service to others?",
                    ]
                )

            return {
                "priority": feedback_priority,
                "timeline": feedback_timeline,
                "collection_methods": collection_methods,
                "questions": feedback_questions,
                "incentives": self._determine_feedback_incentives(risk_category),
                "follow_up_required": risk_category in ["high", "critical"],
                "learning_value": "high" if solution_confidence < 0.8 else "medium",
            }

        except Exception as e:
            logger.error(f"Error generating feedback strategy: {e}")
            return {"error": str(e)}

    def _create_performance_benchmarks(
        self, state: ComplaintState, metrics: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create performance benchmarks for future comparison"""
        try:
            current_performance = {
                "execution_time": metrics.get("total_execution_time", 0),
                "success_rate": metrics.get("success_rate", 0),
                "confidence_score": self._calculate_overall_confidence(state),
                "error_rate": metrics.get("error_rate", 0),
                "quality_score": self._calculate_overall_quality(state),
            }

            # Industry benchmarks (mock data - would be real in production)
            industry_benchmarks = {
                "execution_time": 25.0,  # seconds
                "success_rate": 0.92,
                "confidence_score": 0.88,
                "error_rate": 0.05,
                "quality_score": 0.85,
            }

            # Calculate performance comparison
            performance_comparison = {}
            for metric, current_value in current_performance.items():
                industry_value = industry_benchmarks.get(metric, current_value)

                if metric in ["execution_time", "error_rate"]:
                    # Lower is better
                    performance_ratio = industry_value / max(current_value, 0.001)
                else:
                    # Higher is better
                    performance_ratio = current_value / max(industry_value, 0.001)

                performance_comparison[metric] = {
                    "current": current_value,
                    "industry": industry_value,
                    "ratio": performance_ratio,
                    "status": "above" if performance_ratio > 1.0 else "below",
                }

            return {
                "current_performance": current_performance,
                "industry_benchmarks": industry_benchmarks,
                "performance_comparison": performance_comparison,
                "overall_ranking": self._calculate_overall_ranking(
                    performance_comparison
                ),
                "improvement_areas": self._identify_improvement_areas(
                    performance_comparison
                ),
                "benchmark_timestamp": time.time(),
            }

        except Exception as e:
            logger.error(f"Error creating performance benchmarks: {e}")
            return {"error": str(e)}

    def _setup_continuous_monitoring(self, state: ComplaintState) -> Dict[str, Any]:
        """Setup continuous monitoring configuration"""
        try:
            risk_category = state.get("risk_assessment", {}).get(
                "risk_category", "medium"
            )

            monitoring_config = {
                "enabled": True,
                "monitoring_frequency": self._determine_monitoring_frequency(
                    risk_category
                ),
                "metrics_to_track": [
                    "customer_satisfaction",
                    "resolution_effectiveness",
                    "response_time",
                    "escalation_rate",
                ],
                "alert_thresholds": {
                    "satisfaction_below": 3.0,
                    "response_time_above": 48,  # hours
                    "escalation_probability_above": 0.8,
                },
                "notification_channels": self._determine_notification_channels(
                    risk_category
                ),
                "review_schedule": self._create_review_schedule(risk_category),
                "data_retention_days": 365,
                "automated_actions": self._define_automated_actions(risk_category),
            }

            return monitoring_config

        except Exception as e:
            logger.error(f"Error setting up continuous monitoring: {e}")
            return {"error": str(e)}

    def _generate_improvement_recommendations(
        self,
        state: ComplaintState,
        metrics: Dict[str, Any],
        learning_insights: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """Generate specific improvement recommendations"""
        try:
            recommendations = []

            # Performance-based recommendations
            if metrics.get("total_execution_time", 0) > 30:
                recommendations.append(
                    {
                        "category": "performance",
                        "priority": "medium",
                        "recommendation": "Optimize agent processing pipeline",
                        "expected_impact": "25% reduction in processing time",
                        "implementation_effort": "medium",
                        "timeline": "2-4 weeks",
                    }
                )

            # Quality-based recommendations
            quality_metrics = metrics.get("quality_metrics", {})
            if quality_metrics.get("overall_coherence", 1.0) < 0.8:
                recommendations.append(
                    {
                        "category": "quality",
                        "priority": "high",
                        "recommendation": "Improve inter-agent communication and state management",
                        "expected_impact": "15% improvement in solution quality",
                        "implementation_effort": "high",
                        "timeline": "4-6 weeks",
                    }
                )

            # Learning-based recommendations
            opportunities = learning_insights.get("opportunities", [])
            for opportunity in opportunities:
                if opportunity["type"] == "risk_model_improvement":
                    recommendations.append(
                        {
                            "category": "model_improvement",
                            "priority": "high",
                            "recommendation": "Enhance risk prediction model with additional training data",
                            "expected_impact": "10% improvement in risk prediction accuracy",
                            "implementation_effort": "medium",
                            "timeline": "3-4 weeks",
                        }
                    )

            # Error-based recommendations
            if state.get("errors"):
                recommendations.append(
                    {
                        "category": "reliability",
                        "priority": "high",
                        "recommendation": "Implement comprehensive error handling and recovery mechanisms",
                        "expected_impact": "50% reduction in processing errors",
                        "implementation_effort": "medium",
                        "timeline": "2-3 weeks",
                    }
                )

            # Sort by priority
            priority_order = {"high": 3, "medium": 2, "low": 1}
            recommendations.sort(
                key=lambda x: priority_order.get(x["priority"], 0), reverse=True
            )

            return recommendations

        except Exception as e:
            logger.error(f"Error generating improvement recommendations: {e}")
            return []

    # Helper methods
    def _assess_output_quality(
        self, step: Dict[str, Any], state: ComplaintState
    ) -> float:
        """Assess quality of agent output"""
        agent_name = step["agent"]
        output = step.get("output", {})

        if agent_name == "complaint_reader":
            return len(output.get("entities_extracted", 0)) / 5.0  # Normalize to 0-1
        elif agent_name == "complaint_sorter":
            return output.get("confidence_score", 0.5)
        elif agent_name == "risk_checker":
            return output.get("confidence", 0.5)
        else:
            return 0.75  # Default quality score

    def _assess_entity_quality(self, state: ComplaintState) -> float:
        """Assess quality of entity extraction"""
        entities = state.get("entities", {})
        non_empty_entities = [v for v in entities.values() if v]
        return min(len(non_empty_entities) / 5.0, 1.0)  # Normalize to 0-1

    def _assess_classification_accuracy(self, state: ComplaintState) -> float:
        """Assess classification accuracy"""
        return state.get("classification", {}).get("confidence_score", 0.75)

    def _assess_risk_confidence(self, state: ComplaintState) -> float:
        """Assess risk prediction confidence"""
        return state.get("risk_assessment", {}).get("confidence", 0.75)

    def _assess_solution_relevance(self, state: ComplaintState) -> float:
        """Assess solution relevance"""
        solution = state.get("solution", {})
        return solution.get("solution_metrics", {}).get("confidence", 0.75)

    def _assess_overall_coherence(self, state: ComplaintState) -> float:
        """Assess overall workflow coherence"""
        # Simple coherence check - would be more sophisticated in production
        has_entities = bool(state.get("entities"))
        has_classification = bool(state.get("classification"))
        has_risk = bool(state.get("risk_assessment"))
        has_solution = bool(state.get("solution"))

        coherence_score = (
            sum([has_entities, has_classification, has_risk, has_solution]) / 4.0
        )
        return coherence_score

    def _calculate_speed_percentile(self, execution_time: float) -> float:
        """Calculate speed percentile compared to benchmarks"""
        # Mock calculation - would use real data in production
        if execution_time < 15:
            return 0.95
        elif execution_time < 25:
            return 0.80
        elif execution_time < 35:
            return 0.60
        else:
            return 0.40

    def _calculate_accuracy_percentile(
        self, quality_metrics: Dict[str, float]
    ) -> float:
        """Calculate accuracy percentile"""
        avg_quality = sum(quality_metrics.values()) / max(len(quality_metrics), 1)
        return avg_quality  # Simplified - would use real benchmarks

    def _calculate_efficiency_score(
        self, execution_time: float, success_rate: float
    ) -> float:
        """Calculate efficiency score"""
        # Efficiency = Success Rate / (Execution Time / Target Time)
        target_time = 20.0  # seconds
        time_ratio = execution_time / target_time
        efficiency = success_rate / max(time_ratio, 0.1)
        return min(efficiency, 1.0)

    def _assess_complexity_handling(self, state: ComplaintState) -> str:
        """Assess how well the workflow handled complaint complexity"""
        complexity_score = state.get("metadata", {}).get("complexity_score", 0.5)
        success_rate = len(
            [s for s in state.get("processing_steps", []) if s["status"] == "success"]
        ) / max(len(state.get("processing_steps", [])), 1)

        if complexity_score > 0.7 and success_rate > 0.9:
            return "excellent"
        elif complexity_score > 0.5 and success_rate > 0.8:
            return "good"
        elif success_rate > 0.7:
            return "adequate"
        else:
            return "needs_improvement"

    def _calculate_overall_confidence(self, state: ComplaintState) -> float:
        """Calculate overall workflow confidence"""
        confidences = []

        # Entity extraction confidence (implicit)
        entities = state.get("entities", {})
        if entities:
            confidences.append(0.85)  # Default entity confidence

        # Classification confidence
        classification_conf = state.get("classification", {}).get("confidence_score", 0)
        if classification_conf > 0:
            confidences.append(classification_conf)

        # Risk assessment confidence
        risk_conf = state.get("risk_assessment", {}).get("confidence", 0)
        if risk_conf > 0:
            confidences.append(risk_conf)

        # Solution confidence
        solution_conf = (
            state.get("solution", {}).get("solution_metrics", {}).get("confidence", 0)
        )
        if solution_conf > 0:
            confidences.append(solution_conf)

        return sum(confidences) / max(len(confidences), 1)

    def _calculate_overall_quality(self, state: ComplaintState) -> float:
        """Calculate overall workflow quality"""
        quality_factors = [
            self._assess_entity_quality(state),
            self._assess_classification_accuracy(state),
            self._assess_risk_confidence(state),
            self._assess_solution_relevance(state),
            self._assess_overall_coherence(state),
        ]

        return sum(quality_factors) / len(quality_factors)

    def _calculate_feedback_importance(
        self, opportunities: List[Dict[str, Any]]
    ) -> str:
        """Calculate importance of collecting feedback"""
        if len(opportunities) > 3:
            return "critical"
        elif len(opportunities) > 1:
            return "high"
        else:
            return "medium"

    def _determine_feedback_incentives(self, risk_category: str) -> List[str]:
        """Determine feedback incentives based on risk"""
        if risk_category == "high":
            return ["priority_support", "service_credit"]
        elif risk_category == "medium":
            return ["service_credit"]
        else:
            return []

    def _calculate_overall_ranking(self, performance_comparison: Dict[str, Any]) -> str:
        """Calculate overall performance ranking"""
        above_industry = sum(
            1
            for metric in performance_comparison.values()
            if metric["status"] == "above"
        )
        total_metrics = len(performance_comparison)

        percentage_above = above_industry / total_metrics

        if percentage_above >= 0.8:
            return "top_tier"
        elif percentage_above >= 0.6:
            return "above_average"
        elif percentage_above >= 0.4:
            return "average"
        else:
            return "below_average"

    def _identify_improvement_areas(
        self, performance_comparison: Dict[str, Any]
    ) -> List[str]:
        """Identify areas needing improvement"""
        improvement_areas = []

        for metric, comparison in performance_comparison.items():
            if comparison["status"] == "below" and comparison["ratio"] < 0.8:
                improvement_areas.append(metric)

        return improvement_areas

    def _determine_monitoring_frequency(self, risk_category: str) -> str:
        """Determine monitoring frequency based on risk"""
        frequencies = {
            "low": "weekly",
            "medium": "daily",
            "high": "hourly",
            "critical": "real_time",
        }
        return frequencies.get(risk_category, "daily")

    def _determine_notification_channels(self, risk_category: str) -> List[str]:
        """Determine notification channels based on risk"""
        if risk_category in ["high", "critical"]:
            return ["email", "sms", "slack", "dashboard"]
        elif risk_category == "medium":
            return ["email", "dashboard"]
        else:
            return ["dashboard"]

    def _create_review_schedule(self, risk_category: str) -> Dict[str, str]:
        """Create review schedule based on risk"""
        schedules = {
            "low": {"frequency": "monthly", "depth": "summary"},
            "medium": {"frequency": "weekly", "depth": "detailed"},
            "high": {"frequency": "daily", "depth": "comprehensive"},
            "critical": {"frequency": "hourly", "depth": "real_time"},
        }
        return schedules.get(risk_category, schedules["medium"])

    def _define_automated_actions(self, risk_category: str) -> List[Dict[str, str]]:
        """Define automated actions based on risk"""
        actions = []

        if risk_category in ["high", "critical"]:
            actions.extend(
                [
                    {
                        "trigger": "satisfaction_below_threshold",
                        "action": "escalate_to_supervisor",
                    },
                    {"trigger": "no_response_24h", "action": "send_follow_up_email"},
                ]
            )

        actions.append(
            {"trigger": "feedback_received", "action": "update_learning_models"}
        )

        return actions


# Global instance
feedback_logger_agent = FeedbackLoggerAgent()
