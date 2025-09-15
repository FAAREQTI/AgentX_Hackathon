import logging
import time
import json
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from langchain_core.messages import AIMessage

from app.services.llm import llm_service
from app.models.schemas import ComplaintState

logger = logging.getLogger(__name__)


class ComplaintSorterAgent:

    def __init__(self):
        self.classification_cache = {}
        self.validation_threshold = 0.8

    async def process(
        self, state: ComplaintState, db: AsyncSession = None
    ) -> ComplaintState:
        start_time = time.time()

        try:
            logger.info(
                f"Starting complaint_sorter for complaint {state['complaint_id']}"
            )

            # Step 1: Get narrative (use redacted version if available)
            narrative = state.get("redacted_narrative", state["narrative"])
            entities = state.get("entities", {})

            # Step 2: Classify complaint using LLM
            classification = await llm_service.classify_complaint(narrative, entities)

            # Step 3: Historical validation
            if db:
                validation_result = await self._validate_with_history(
                    db, classification, entities, state["tenant_id"]
                )
                classification.update(validation_result)

            # Step 4: Confidence scoring
            confidence_score = self._calculate_confidence(classification, entities)
            classification["confidence_score"] = confidence_score

            # Step 5: Category enrichment
            enriched_classification = await self._enrich_classification(
                classification, narrative, entities
            )

            # Update state
            state["classification"] = enriched_classification
            state["current_agent"] = "complaint_sorter"

            # Add processing step
            execution_time = time.time() - start_time
            step = {
                "agent": "complaint_sorter",
                "status": "success",
                "execution_time": execution_time,
                "output": {
                    "product_category": enriched_classification.get("product_category"),
                    "issue_category": enriched_classification.get("issue_category"),
                    "urgency_level": enriched_classification.get("urgency_level"),
                    "confidence_score": confidence_score,
                    "validated": enriched_classification.get(
                        "historically_validated", False
                    ),
                },
            }
            state["processing_steps"].append(step)

            # Add message
            message = AIMessage(
                content=f"🏷️ Complaint Classification Complete!\n"
                f"📦 Product: {enriched_classification.get('product_category', 'Unknown')}\n"
                f"⚠️ Issue: {enriched_classification.get('issue_category', 'Unknown')}\n"
                f"🚨 Urgency: {enriched_classification.get('urgency_level', 'Medium')}\n"
                f"📊 Confidence: {confidence_score:.2f}\n"
                f"✅ Historical Validation: {'Passed' if enriched_classification.get('historically_validated') else 'Pending'}"
            )
            state["messages"].append(message)

            logger.info(f"Complaint sorter completed in {execution_time:.2f}s")

        except Exception as e:
            logger.error(f"Error in complaint_sorter: {e}")
            state["errors"].append(f"complaint_sorter: {str(e)}")

            # Add failed step
            execution_time = time.time() - start_time
            step = {
                "agent": "complaint_sorter",
                "status": "failed",
                "execution_time": execution_time,
                "error": str(e),
            }
            state["processing_steps"].append(step)

        return state

    async def _validate_with_history(
        self,
        db: AsyncSession,
        classification: Dict[str, str],
        entities: Dict[str, Any],
        tenant_id: str,
    ) -> Dict[str, Any]:
        """Validate classification against historical data"""
        try:
            # Query similar classifications from history
            query = text(
                """
                SELECT 
                    cl.product, cl.issue, cl.company,
                    COUNT(*) as frequency,
                    AVG(r.risk) as avg_risk
                FROM complaints_labels cl
                LEFT JOIN risk_scores r ON cl.complaint_id = r.complaint_id
                WHERE cl.tenant_id = :tenant_id
                AND (cl.product = :product OR cl.issue = :issue)
                GROUP BY cl.product, cl.issue, cl.company
                ORDER BY frequency DESC
                LIMIT 10
            """
            )

            result = await db.execute(
                query,
                {
                    "tenant_id": tenant_id,
                    "product": classification.get("product_category"),
                    "issue": classification.get("issue_category"),
                },
            )

            historical_patterns = result.fetchall()

            validation_result = {
                "historically_validated": len(historical_patterns) > 0,
                "historical_frequency": len(historical_patterns),
                "similar_patterns": [
                    {
                        "product": row.product,
                        "issue": row.issue,
                        "frequency": row.frequency,
                        "avg_risk": float(row.avg_risk) if row.avg_risk else 0.0,
                    }
                    for row in historical_patterns[:3]
                ],
            }

            return validation_result

        except Exception as e:
            logger.error(f"Error in historical validation: {e}")
            return {"historically_validated": False, "validation_error": str(e)}

    def _calculate_confidence(
        self, classification: Dict[str, str], entities: Dict[str, Any]
    ) -> float:
        """Calculate confidence score for classification"""
        confidence = 0.5  # Base confidence

        # Entity alignment boosts confidence
        if entities.get("product") and classification.get("product_category"):
            if (
                entities["product"].lower()
                in classification["product_category"].lower()
            ):
                confidence += 0.2

        if entities.get("issue") and classification.get("issue_category"):
            if any(
                word in classification["issue_category"].lower()
                for word in entities["issue"].lower().split()
            ):
                confidence += 0.2

        # Urgency indicators
        urgency_level = classification.get("urgency_level", "medium")
        if urgency_level in ["high", "critical"]:
            confidence += 0.1

        return min(confidence, 1.0)

    async def _enrich_classification(
        self, classification: Dict[str, str], narrative: str, entities: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Enrich classification with additional context"""
        enriched = classification.copy()

        # Add subcategories
        enriched["subcategories"] = self._identify_subcategories(
            classification.get("issue_category", ""), narrative
        )

        # Add regulatory flags
        enriched["regulatory_flags"] = self._check_regulatory_flags(narrative, entities)

        # Add complexity indicators
        enriched["complexity_indicators"] = self._identify_complexity_indicators(
            narrative, entities
        )

        # Add priority score
        enriched["priority_score"] = self._calculate_priority_score(
            classification, entities
        )

        return enriched

    def _identify_subcategories(self, issue_category: str, narrative: str) -> List[str]:
        subcategories = []
        narrative_lower = narrative.lower()

        subcategory_mapping = {
            "unauthorized_charges": [
                "fraud",
                "identity_theft",
                "card_skimming",
                "online_fraud",
            ],
            "billing_dispute": [
                "incorrect_amount",
                "duplicate_charge",
                "service_not_received",
            ],
            "service_quality": [
                "poor_service",
                "long_wait_times",
                "rude_staff",
                "system_outage",
            ],
            "account_access": [
                "locked_account",
                "forgotten_password",
                "technical_issues",
            ],
        }

        if issue_category in subcategory_mapping:
            for subcategory in subcategory_mapping[issue_category]:
                if subcategory.replace("_", " ") in narrative_lower:
                    subcategories.append(subcategory)

        return subcategories

    def _check_regulatory_flags(
        self, narrative: str, entities: Dict[str, Any]
    ) -> List[str]:
        flags = []
        narrative_lower = narrative.lower()

        regulatory_keywords = {
            "fair_credit_reporting": ["credit report", "credit score", "credit bureau"],
            "truth_in_lending": ["interest rate", "apr", "loan terms"],
            "fair_debt_collection": [
                "debt collector",
                "collection agency",
                "harassment",
            ],
            "equal_credit_opportunity": [
                "discrimination",
                "denied credit",
                "unfair treatment",
            ],
            "electronic_fund_transfer": ["atm", "debit card", "electronic transfer"],
        }

        for regulation, keywords in regulatory_keywords.items():
            if any(keyword in narrative_lower for keyword in keywords):
                flags.append(regulation)

        return flags

    def _identify_complexity_indicators(
        self, narrative: str, entities: Dict[str, Any]
    ) -> List[str]:
        indicators = []

        # Multiple products/services
        if len([v for v in entities.values() if v and isinstance(v, str)]) > 3:
            indicators.append("multiple_products")

        # Long narrative
        if len(narrative) > 1000:
            indicators.append("detailed_narrative")

        # Multiple dates/amounts
        if narrative.count("$") > 2 or len(narrative.split("date")) > 2:
            indicators.append("multiple_transactions")

        # Legal language
        legal_terms = ["lawsuit", "attorney", "legal action", "violation", "breach"]
        if any(term in narrative.lower() for term in legal_terms):
            indicators.append("legal_implications")

        return indicators

    def _calculate_priority_score(
        self, classification: Dict[str, str], entities: Dict[str, Any]
    ) -> float:
        """Calculate priority score (0-1) for complaint handling"""
        score = 0.3  # Base priority

        # Urgency level impact
        urgency_weights = {"low": 0.0, "medium": 0.2, "high": 0.4, "critical": 0.6}
        score += urgency_weights.get(classification.get("urgency_level", "medium"), 0.2)

        # Financial amount impact
        if entities.get("amount"):
            try:
                amount_str = str(entities["amount"]).replace("$", "").replace(",", "")
                amount = float(amount_str)
                if amount > 10000:
                    score += 0.3
                elif amount > 1000:
                    score += 0.2
                elif amount > 100:
                    score += 0.1
            except (ValueError, TypeError):
                pass

        # Issue type impact
        high_priority_issues = ["fraud", "unauthorized_charges", "discrimination"]
        if classification.get("issue_category") in high_priority_issues:
            score += 0.2

        return min(score, 1.0)


# Global instance
complaint_sorter_agent = ComplaintSorterAgent()
