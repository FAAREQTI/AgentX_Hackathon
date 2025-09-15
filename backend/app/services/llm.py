"""
LLM service for AI operations
"""
import logging
from typing import Dict, Any, List, Optional
from openai import AsyncOpenAI
import json

from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


class LLMService:
    """Service for LLM operations"""
    
    def __init__(self):
        self.model = "gpt-4-turbo-preview"
        self.temperature = 0.1
    
    async def extract_entities(self, narrative: str) -> Dict[str, Any]:
        """Extract entities from complaint narrative"""
        try:
            prompt = f"""
            Extract the following entities from this complaint narrative:
            - product: The financial product (credit card, loan, mortgage, etc.)
            - issue: The main issue type (unauthorized charges, billing dispute, etc.)
            - company: The company name mentioned
            - amount: Any monetary amount mentioned
            - date: Any dates mentioned
            
            Narrative: {narrative}
            
            Return as JSON with keys: product, issue, company, amount, date
            If any entity is not found, use null.
            """
            
            response = await client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.temperature,
                response_format={"type": "json_object"}
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            logger.error(f"Error extracting entities: {e}")
            return {}
    
    async def classify_complaint(self, narrative: str, entities: Dict[str, Any]) -> Dict[str, str]:
        """Classify complaint into categories"""
        try:
            prompt = f"""
            Classify this complaint into the following categories:
            
            Product Categories:
            - credit_card, loan, mortgage, deposit_account, money_transfer, debt_collection, credit_reporting, other
            
            Issue Categories:
            - unauthorized_charges, billing_dispute, service_quality, account_access, fraud, privacy, discrimination, other
            
            Urgency Levels:
            - low, medium, high, critical
            
            Narrative: {narrative}
            Entities: {json.dumps(entities)}
            
            Return as JSON with keys: product_category, issue_category, urgency_level
            """
            
            response = await client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.temperature,
                response_format={"type": "json_object"}
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            logger.error(f"Error classifying complaint: {e}")
            return {}
    
    async def generate_solution(
        self, 
        narrative: str, 
        entities: Dict[str, Any],
        classification: Dict[str, str],
        similar_cases: List[Dict[str, Any]],
        risk_assessment: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate solution and response letter"""
        try:
            # Prepare context from similar cases
            similar_context = ""
            if similar_cases:
                similar_context = "Similar successful resolutions:\n"
                for case in similar_cases[:3]:  # Top 3 similar cases
                    similar_context += f"- {case.get('resolution_strategy', 'N/A')}\n"
            
            prompt = f"""
            Generate a professional resolution strategy and response letter for this complaint:
            
            Complaint: {narrative}
            Entities: {json.dumps(entities)}
            Classification: {json.dumps(classification)}
            Risk Level: {risk_assessment.get('risk_category', 'medium')}
            
            {similar_context}
            
            Provide:
            1. resolution_strategy: Brief strategy description
            2. response_letter: Professional response letter
            3. next_steps: List of recommended actions
            4. estimated_resolution_time: Time estimate in hours
            
            Return as JSON with these keys.
            """
            
            response = await client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.temperature,
                response_format={"type": "json_object"}
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            logger.error(f"Error generating solution: {e}")
            return {}
    
    async def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of complaint text"""
        try:
            prompt = f"""
            Analyze the sentiment and emotional tone of this complaint:
            
            Text: {text}
            
            Provide:
            - sentiment: positive, negative, neutral
            - emotion: angry, frustrated, disappointed, confused, other
            - urgency_indicators: list of phrases indicating urgency
            - escalation_risk: low, medium, high
            
            Return as JSON.
            """
            
            response = await client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.temperature,
                response_format={"type": "json_object"}
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {e}")
            return {}


# Global instance
llm_service = LLMService()