"""
Agent 1: Complaint Reader
Handles entity extraction, embeddings, and PII redaction
"""
import logging
import time
import json
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from langchain_core.messages import AIMessage
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine

from app.services.llm import llm_service
from app.services.embeddings import embedding_service
from app.models.schemas import ComplaintState

logger = logging.getLogger(__name__)


class ComplaintReaderAgent:
    """Agent responsible for reading and processing raw complaint data"""
    
    def __init__(self):
        self.analyzer = AnalyzerEngine()
        self.anonymizer = AnonymizerEngine()
    
    async def process(self, state: ComplaintState, db: AsyncSession = None) -> ComplaintState:
        """Process complaint through reading and extraction pipeline"""
        start_time = time.time()
        
        try:
            logger.info(f"Starting complaint_reader for complaint {state['complaint_id']}")
            
            # Step 1: PII Detection and Redaction
            pii_results = self.analyzer.analyze(
                text=state["narrative"],
                language='en',
                entities=["PERSON", "EMAIL_ADDRESS", "PHONE_NUMBER", "CREDIT_CARD", "US_SSN"]
            )
            
            # Redact PII for safe processing
            redacted_narrative = self.anonymizer.anonymize(
                text=state["narrative"],
                analyzer_results=pii_results
            ).text
            
            # Step 2: Extract entities using LLM
            entities = await llm_service.extract_entities(redacted_narrative)
            
            # Step 3: Analyze sentiment and emotional tone
            sentiment = await llm_service.analyze_sentiment(redacted_narrative)
            
            # Step 4: Create embeddings for vector search
            if db:
                await embedding_service.store_complaint_embedding(
                    db, state["complaint_id"], redacted_narrative
                )
            
            # Step 5: Extract additional metadata
            metadata = self._extract_metadata(state["narrative"], entities)
            
            # Update state with extracted information
            state["entities"] = entities
            state["sentiment"] = sentiment
            state["redacted_narrative"] = redacted_narrative
            state["pii_detected"] = len(pii_results) > 0
            state["metadata"] = metadata
            state["current_agent"] = "complaint_reader"
            
            # Add processing step for tracking
            execution_time = time.time() - start_time
            step = {
                "agent": "complaint_reader",
                "status": "success",
                "execution_time": execution_time,
                "output": {
                    "entities_extracted": len(entities),
                    "pii_detected": len(pii_results),
                    "sentiment": sentiment.get('sentiment', 'neutral'),
                    "confidence": sentiment.get('confidence', 0.0)
                }
            }
            state["processing_steps"].append(step)
            
            # Add message to conversation
            message = AIMessage(
                content=f"✅ Complaint processed successfully!\n"
                       f"📊 Entities: {json.dumps(entities, indent=2)}\n"
                       f"😊 Sentiment: {sentiment.get('sentiment', 'neutral')} "
                       f"({sentiment.get('confidence', 0.0):.2f} confidence)\n"
                       f"🔒 PII Protection: {'Enabled' if len(pii_results) > 0 else 'Not needed'}"
            )
            state["messages"].append(message)
            
            logger.info(f"Complaint reader completed in {execution_time:.2f}s")
            
        except Exception as e:
            logger.error(f"Error in complaint_reader: {e}")
            state["errors"].append(f"complaint_reader: {str(e)}")
            
            # Add failed step
            execution_time = time.time() - start_time
            step = {
                "agent": "complaint_reader",
                "status": "failed",
                "execution_time": execution_time,
                "error": str(e)
            }
            state["processing_steps"].append(step)
            
        return state
    
    def _extract_metadata(self, narrative: str, entities: Dict[str, Any]) -> Dict[str, Any]:
        """Extract additional metadata from complaint"""
        return {
            "narrative_length": len(narrative),
            "word_count": len(narrative.split()),
            "has_amount": bool(entities.get("amount")),
            "has_date": bool(entities.get("date")),
            "urgency_keywords": self._detect_urgency_keywords(narrative),
            "complexity_score": self._calculate_complexity_score(narrative, entities)
        }
    
    def _detect_urgency_keywords(self, text: str) -> list:
        """Detect urgency indicators in complaint text"""
        urgency_keywords = [
            "urgent", "emergency", "immediately", "asap", "critical",
            "fraud", "unauthorized", "stolen", "hacked", "dispute"
        ]
        
        found_keywords = []
        text_lower = text.lower()
        
        for keyword in urgency_keywords:
            if keyword in text_lower:
                found_keywords.append(keyword)
        
        return found_keywords
    
    def _calculate_complexity_score(self, narrative: str, entities: Dict[str, Any]) -> float:
        """Calculate complaint complexity score (0-1)"""
        score = 0.0
        
        # Length factor
        if len(narrative) > 500:
            score += 0.2
        elif len(narrative) > 200:
            score += 0.1
        
        # Entity complexity
        entity_count = len([v for v in entities.values() if v])
        if entity_count > 3:
            score += 0.3
        elif entity_count > 1:
            score += 0.2
        
        # Multiple issues indicator
        if "and" in narrative.lower() or "also" in narrative.lower():
            score += 0.2
        
        # Financial amounts
        if entities.get("amount"):
            score += 0.3
        
        return min(score, 1.0)


# Global instance
complaint_reader_agent = ComplaintReaderAgent()