import logging
import time
import json
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession

from langchain_core.messages import AIMessage

from app.services.risk_model import risk_model
from app.models.schemas import ComplaintState

logger = logging.getLogger(__name__)


class RiskCheckerAgent:

    def __init__(self):
        self.risk_thresholds = {
            "low": 0.3,
            "medium": 0.6,
            "high": 0.8,
            "critical": 0.95,
        }
        self.explanation_templates = {
            "high": "⚠️ HIGH RISK: Immediate attention required",
            "medium": "⚡ MEDIUM RISK: Monitor closely",
            "low": " LOW RISK: Standard processing",
        }

    async def process(
        self, state: ComplaintState, db: AsyncSession = None
    ) -> ComplaintState:
        start_time = time.time()

        try:
            logger.info(f"Starting risk_checker for complaint {state['complaint_id']}")

            # Step 1: Extract features for risk model
            risk_features = await self._extract_risk_features(state, db)

            # Step 2: Run XGBoost risk prediction
            risk_prediction = await self._predict_risk(state, risk_features, db)

            # Step 3: Generate explainable factors
            risk_explanation = self._generate_risk_explanation(
                risk_prediction, risk_features, state
            )

            # Step 4: Calculate escalation probability
            escalation_probability = self._calculate_escalation_probability(
                risk_prediction, state
            )

            # Step 5: Generate mitigation recommendations
            mitigation_strategies = self._generate_mitigation_strategies(
                risk_prediction, state
            )

            # Step 6: Risk monitoring setup
            monitoring_config = self._setup_risk_monitoring(risk_prediction)

            # Compile comprehensive risk assessment
            comprehensive_risk = {
                **risk_prediction,
                "explanation": risk_explanation,
                "escalation_probability": escalation_probability,
                "mitigation_strategies": mitigation_strategies,
                "monitoring_config": monitoring_config,
                "risk_features": risk_features,
                "assessment_metadata": {
                    "model_version": risk_prediction.get("model_version", "1.0.0"),
                    "feature_count": len(risk_features),
                    "confidence_level": risk_prediction.get("confidence", 0.85),
                    "assessment_timestamp": time.time(),
                },
            }

            # Update state
            state["risk_assessment"] = comprehensive_risk
            state["current_agent"] = "risk_checker"

            # Add processing step
            execution_time = time.time() - start_time
            step = {
                "agent": "risk_checker",
                "status": "success",
                "execution_time": execution_time,
                "output": {
                    "risk_score": risk_prediction.get("risk_score", 0.0),
                    "risk_category": risk_prediction.get("risk_category", "medium"),
                    "escalation_probability": escalation_probability,
                    "mitigation_strategies_count": len(mitigation_strategies),
                    "confidence": risk_prediction.get("confidence", 0.85),
                },
            }
            state["processing_steps"].append(step)

            # Add message
            risk_emoji = self._get_risk_emoji(
                risk_prediction.get("risk_category", "medium")
            )
            message = AIMessage(
                content=f"{risk_emoji} Risk Assessment Complete!\n"
                f"📊 Risk Score: {risk_prediction.get('risk_score', 0.0):.2f}\n"
                f"🏷️ Risk Category: {risk_prediction.get('risk_category', 'Medium').upper()}\n"
                f"📈 Escalation Probability: {escalation_probability:.1%}\n"
                f"🛡️ Mitigation Strategies: {len(mitigation_strategies)} recommended\n"
                f"🎯 Confidence: {risk_prediction.get('confidence', 0.85):.1%}\n"
                f"💡 Key Factors: {', '.join(risk_explanation.get('primary_factors', [])[:2])}"
            )
            state["messages"].append(message)

            logger.info(f"Risk checker completed in {execution_time:.2f}s")

        except Exception as e:
            logger.error(f"Error in risk_checker: {e}")
            state["errors"].append(f"risk_checker: {str(e)}")

            # Add failed step
            execution_time = time.time() - start_time
            step = {
                "agent": "risk_checker",
                "status": "failed",
                "execution_time": execution_time,
                "error": str(e),
            }
            state["processing_steps"].append(step)

        return state

    async def _extract_risk_features(
        self, state: ComplaintState, db: AsyncSession
    ) -> Dict[str, float]:
        """Extract features for risk model prediction"""
        try:
            entities = state.get("entities", {})
            classification = state.get("classification", {})
            sentiment = state.get("sentiment", {})
            metadata = state.get("metadata", {})

            # Use risk model service to extract features
            features = await risk_model.extract_features(
                db=db,
                narrative=state["narrative"],
                entities=entities,
                classification=classification,
                sentiment=sentiment,
                tenant_id=state["tenant_id"],
                user_id=state.get("user_id"),
            )

            # Add additional computed features
            additional_features = {
                "complaint_complexity": metadata.get("complexity_score", 0.5),
                "urgency_keywords_count": len(metadata.get("urgency_keywords", [])),
                "narrative_sentiment_score": self._convert_sentiment_to_score(
                    sentiment
                ),
                "classification_confidence": classification.get(
                    "confidence_score", 0.5
                ),
                "weekend_submission": self._is_weekend_submission(),
                "business_hours_submission": self._is_business_hours_submission(),
            }

            features.update(additional_features)
            return features

        except Exception as e:
            logger.error(f"Error extracting risk features: {e}")
            return self._get_default_features()

    async def _predict_risk(
        self, state: ComplaintState, features: Dict[str, float], db: AsyncSession
    ) -> Dict[str, Any]:
        """Run risk prediction using XGBoost model"""
        try:
            # Use risk model service for prediction
            risk_assessment = await risk_model.predict_risk(
                db=db,
                narrative=state["narrative"],
                entities=state.get("entities", {}),
                classification=state.get("classification", {}),
                sentiment=state.get("sentiment", {}),
                tenant_id=state["tenant_id"],
                user_id=state.get("user_id"),
            )

            # Enhance with additional analysis
            enhanced_assessment = risk_assessment.copy()
            enhanced_assessment.update(
                {
                    "prediction_method": "xgboost_ensemble",
                    "feature_importance": self._calculate_feature_importance(features),
                    "risk_drivers": self._identify_risk_drivers(
                        features, risk_assessment["risk_score"]
                    ),
                    "historical_context": await self._get_historical_risk_context(
                        state, db
                    ),
                }
            )

            return enhanced_assessment

        except Exception as e:
            logger.error(f"Error in risk prediction: {e}")
            return self._get_default_risk_assessment()

    def _generate_risk_explanation(
        self,
        risk_prediction: Dict[str, Any],
        features: Dict[str, float],
        state: ComplaintState,
    ) -> Dict[str, Any]:
        """Generate human-readable explanation of risk factors"""
        try:
            risk_score = risk_prediction.get("risk_score", 0.5)
            risk_category = risk_prediction.get("risk_category", "medium")

            explanation = {
                "summary": self.explanation_templates.get(
                    risk_category, "Risk assessment completed"
                ),
                "primary_factors": [],
                "contributing_factors": [],
                "mitigating_factors": [],
                "detailed_analysis": {},
            }

            # Analyze primary risk factors
            if risk_score >= 0.7:
                explanation["primary_factors"].extend(
                    [
                        "High-risk complaint category detected",
                        "Multiple escalation indicators present",
                    ]
                )

            # Sentiment-based factors
            sentiment = state.get("sentiment", {})
            if sentiment.get("sentiment") == "negative":
                explanation["primary_factors"].append("Negative customer sentiment")
            if sentiment.get("emotion") == "angry":
                explanation["contributing_factors"].append("Customer expressing anger")

            # Classification-based factors
            classification = state.get("classification", {})
            if classification.get("urgency_level") in ["high", "critical"]:
                explanation["primary_factors"].append("High urgency classification")

            # Financial impact
            entities = state.get("entities", {})
            if entities.get("amount"):
                explanation["contributing_factors"].append("Financial amount involved")

            # Historical context
            if features.get("historical_complaints", 0) > 2:
                explanation["contributing_factors"].append(
                    "Multiple previous complaints"
                )
            elif features.get("historical_complaints", 0) == 0:
                explanation["mitigating_factors"].append("First-time complaint")

            # Complexity factors
            if features.get("complaint_complexity", 0) > 0.7:
                explanation["contributing_factors"].append(
                    "Complex complaint structure"
                )

            # Timing factors
            if features.get("weekend_submission", 0) == 1:
                explanation["contributing_factors"].append(
                    "Weekend submission (delayed response risk)"
                )

            # Detailed analysis
            explanation["detailed_analysis"] = {
                "risk_score_breakdown": {
                    "base_risk": 0.3,
                    "sentiment_adjustment": self._calculate_sentiment_adjustment(
                        sentiment
                    ),
                    "urgency_adjustment": self._calculate_urgency_adjustment(
                        classification
                    ),
                    "historical_adjustment": self._calculate_historical_adjustment(
                        features
                    ),
                    "complexity_adjustment": self._calculate_complexity_adjustment(
                        features
                    ),
                },
                "confidence_factors": {
                    "data_completeness": min(len(features) / 10, 1.0),
                    "model_certainty": risk_prediction.get("confidence", 0.85),
                    "historical_validation": features.get("historical_complaints", 0)
                    > 0,
                },
            }

            return explanation

        except Exception as e:
            logger.error(f"Error generating risk explanation: {e}")
            return {"summary": "Risk assessment completed", "error": str(e)}

    def _calculate_escalation_probability(
        self, risk_prediction: Dict[str, Any], state: ComplaintState
    ) -> float:
        """Calculate probability of complaint escalation"""
        try:
            base_probability = risk_prediction.get("risk_score", 0.5)

            # Adjust based on additional factors
            adjustments = 0.0

            # Sentiment adjustment
            sentiment = state.get("sentiment", {})
            if sentiment.get("emotion") == "angry":
                adjustments += 0.15
            elif sentiment.get("sentiment") == "negative":
                adjustments += 0.10

            # Urgency adjustment
            classification = state.get("classification", {})
            urgency_level = classification.get("urgency_level", "medium")
            urgency_multipliers = {
                "low": 0.8,
                "medium": 1.0,
                "high": 1.3,
                "critical": 1.6,
            }
            base_probability *= urgency_multipliers.get(urgency_level, 1.0)

            # Financial impact adjustment
            entities = state.get("entities", {})
            if entities.get("amount"):
                try:
                    amount_str = (
                        str(entities["amount"]).replace("$", "").replace(",", "")
                    )
                    amount = float(amount_str)
                    if amount > 10000:
                        adjustments += 0.20
                    elif amount > 1000:
                        adjustments += 0.10
                except (ValueError, TypeError):
                    pass

            # Regulatory flags adjustment
            regulatory_flags = classification.get("regulatory_flags", [])
            if regulatory_flags:
                adjustments += len(regulatory_flags) * 0.05

            final_probability = min(base_probability + adjustments, 0.95)
            return max(final_probability, 0.05)

        except Exception as e:
            logger.error(f"Error calculating escalation probability: {e}")
            return 0.5

    def _generate_mitigation_strategies(
        self, risk_prediction: Dict[str, Any], state: ComplaintState
    ) -> List[Dict[str, Any]]:
        """Generate risk mitigation strategies"""
        try:
            strategies = []
            risk_score = risk_prediction.get("risk_score", 0.5)
            risk_category = risk_prediction.get("risk_category", "medium")

            # High-risk strategies
            if risk_score >= 0.7:
                strategies.extend(
                    [
                        {
                            "strategy": "immediate_escalation",
                            "description": "Escalate to senior customer service representative immediately",
                            "priority": "critical",
                            "timeline": "Within 1 hour",
                            "success_rate": 0.85,
                        },
                        {
                            "strategy": "proactive_communication",
                            "description": "Initiate proactive communication with customer within 2 hours",
                            "priority": "high",
                            "timeline": "Within 2 hours",
                            "success_rate": 0.78,
                        },
                    ]
                )

            # Medium-risk strategies
            if risk_score >= 0.4:
                strategies.extend(
                    [
                        {
                            "strategy": "expedited_processing",
                            "description": "Process complaint through expedited resolution track",
                            "priority": "medium",
                            "timeline": "Within 24 hours",
                            "success_rate": 0.72,
                        },
                        {
                            "strategy": "supervisor_review",
                            "description": "Have supervisor review case before final resolution",
                            "priority": "medium",
                            "timeline": "Before resolution",
                            "success_rate": 0.68,
                        },
                    ]
                )

            # Sentiment-based strategies
            sentiment = state.get("sentiment", {})
            if sentiment.get("emotion") == "angry":
                strategies.append(
                    {
                        "strategy": "empathy_focused_response",
                        "description": "Use empathy-focused communication techniques",
                        "priority": "high",
                        "timeline": "Immediate",
                        "success_rate": 0.75,
                    }
                )

            # Financial impact strategies
            entities = state.get("entities", {})
            if entities.get("amount"):
                strategies.append(
                    {
                        "strategy": "financial_review",
                        "description": "Conduct thorough financial impact review",
                        "priority": "medium",
                        "timeline": "Within 4 hours",
                        "success_rate": 0.70,
                    }
                )

            # Default strategies
            if not strategies:
                strategies.append(
                    {
                        "strategy": "standard_processing",
                        "description": "Process through standard resolution workflow",
                        "priority": "normal",
                        "timeline": "Within 48 hours",
                        "success_rate": 0.65,
                    }
                )

            return strategies

        except Exception as e:
            logger.error(f"Error generating mitigation strategies: {e}")
            return [{"strategy": "standard_processing", "error": str(e)}]

    def _setup_risk_monitoring(self, risk_prediction: Dict[str, Any]) -> Dict[str, Any]:
        """Setup monitoring configuration based on risk level"""
        risk_score = risk_prediction.get("risk_score", 0.5)
        risk_category = risk_prediction.get("risk_category", "medium")

        monitoring_configs = {
            "high": {
                "check_frequency": "hourly",
                "escalation_threshold": 0.9,
                "auto_escalate": True,
                "notification_channels": ["email", "sms", "slack"],
                "review_required": True,
            },
            "medium": {
                "check_frequency": "daily",
                "escalation_threshold": 0.8,
                "auto_escalate": False,
                "notification_channels": ["email"],
                "review_required": False,
            },
            "low": {
                "check_frequency": "weekly",
                "escalation_threshold": 0.7,
                "auto_escalate": False,
                "notification_channels": [],
                "review_required": False,
            },
        }

        return monitoring_configs.get(risk_category, monitoring_configs["medium"])

    def _convert_sentiment_to_score(self, sentiment: Dict[str, Any]) -> float:
        """Convert sentiment to numerical score"""
        sentiment_scores = {"positive": 0.2, "neutral": 0.5, "negative": 0.8}
        return sentiment_scores.get(sentiment.get("sentiment", "neutral"), 0.5)

    def _is_weekend_submission(self) -> float:
        """Check if complaint was submitted on weekend"""
        from datetime import datetime

        return 1.0 if datetime.now().weekday() >= 5 else 0.0

    def _is_business_hours_submission(self) -> float:
        """Check if complaint was submitted during business hours"""
        from datetime import datetime

        hour = datetime.now().hour
        return 1.0 if 9 <= hour <= 17 else 0.0

    def _calculate_feature_importance(
        self, features: Dict[str, float]
    ) -> Dict[str, float]:
        """Calculate feature importance scores"""
        # Mock feature importance - in production, this would come from the trained model
        importance_weights = {
            "urgency_score": 0.25,
            "sentiment_score": 0.20,
            "historical_complaints": 0.15,
            "amount_mentioned": 0.12,
            "narrative_length": 0.08,
            "complaint_complexity": 0.10,
            "classification_confidence": 0.10,
        }

        return {
            feature: importance_weights.get(feature, 0.05)
            for feature in features.keys()
        }

    def _identify_risk_drivers(
        self, features: Dict[str, float], risk_score: float
    ) -> List[str]:
        """Identify key risk drivers"""
        drivers = []

        if features.get("urgency_score", 0) >= 3:
            drivers.append("High urgency level")

        if features.get("sentiment_score", 0) >= 0.7:
            drivers.append("Negative sentiment")

        if features.get("historical_complaints", 0) > 2:
            drivers.append("Multiple previous complaints")

        if features.get("amount_mentioned", 0) == 1:
            drivers.append("Financial impact involved")

        return drivers

    async def _get_historical_risk_context(
        self, state: ComplaintState, db: AsyncSession
    ) -> Dict[str, Any]:
        """Get historical risk context for similar complaints"""
        try:
            # Mock historical context - in production, query database
            return {
                "similar_complaints_risk_avg": 0.65,
                "tenant_risk_avg": 0.58,
                "industry_risk_avg": 0.62,
                "risk_trend": "stable",
            }
        except Exception as e:
            logger.error(f"Error getting historical risk context: {e}")
            return {}

    def _calculate_sentiment_adjustment(self, sentiment: Dict[str, Any]) -> float:
        """Calculate sentiment-based risk adjustment"""
        if sentiment.get("emotion") == "angry":
            return 0.15
        elif sentiment.get("sentiment") == "negative":
            return 0.10
        elif sentiment.get("sentiment") == "positive":
            return -0.05
        return 0.0

    def _calculate_urgency_adjustment(self, classification: Dict[str, str]) -> float:
        """Calculate urgency-based risk adjustment"""
        urgency_adjustments = {
            "low": -0.1,
            "medium": 0.0,
            "high": 0.15,
            "critical": 0.25,
        }
        return urgency_adjustments.get(
            classification.get("urgency_level", "medium"), 0.0
        )

    def _calculate_historical_adjustment(self, features: Dict[str, float]) -> float:
        """Calculate historical-based risk adjustment"""
        historical_count = features.get("historical_complaints", 0)
        if historical_count > 3:
            return 0.20
        elif historical_count > 1:
            return 0.10
        elif historical_count == 0:
            return -0.05
        return 0.0

    def _calculate_complexity_adjustment(self, features: Dict[str, float]) -> float:
        """Calculate complexity-based risk adjustment"""
        complexity = features.get("complaint_complexity", 0.5)
        if complexity > 0.8:
            return 0.15
        elif complexity > 0.6:
            return 0.08
        return 0.0

    def _get_risk_emoji(self, risk_category: str) -> str:
        """Get emoji for risk category"""
        emojis = {"low": "✅", "medium": "⚡", "high": "⚠️", "critical": "🚨"}
        return emojis.get(risk_category, "⚡")

    def _get_default_features(self) -> Dict[str, float]:
        """Get default features when extraction fails"""
        return {
            "urgency_score": 2.0,
            "sentiment_score": 0.5,
            "historical_complaints": 0.0,
            "amount_mentioned": 0.0,
            "narrative_length": 100.0,
            "complaint_complexity": 0.5,
            "classification_confidence": 0.5,
        }

    def _get_default_risk_assessment(self) -> Dict[str, Any]:
        """Get default risk assessment when prediction fails"""
        return {
            "risk_score": 0.5,
            "risk_category": "medium",
            "confidence": 0.5,
            "factors": {"primary_factors": ["Unable to assess risk - using default"]},
            "model_version": "fallback",
        }


# Global instance
risk_checker_agent = RiskCheckerAgent()
