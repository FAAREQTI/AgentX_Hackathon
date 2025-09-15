"""
Risk assessment model using XGBoost
"""
import logging
import json
import pickle
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import xgboost as xgb
from sklearn.preprocessing import LabelEncoder, StandardScaler

logger = logging.getLogger(__name__)


class RiskModel:
    """XGBoost-based risk assessment model"""
    
    def __init__(self):
        self.model = None
        self.label_encoders = {}
        self.scaler = StandardScaler()
        self.feature_columns = [
            'product_encoded', 'issue_encoded', 'company_encoded',
            'narrative_length', 'amount_mentioned', 'urgency_score',
            'sentiment_score', 'historical_complaints', 'days_since_last_complaint'
        ]
        self.model_version = "1.0.0"
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize or load the XGBoost model"""
        try:
            # In production, load from file
            # For now, create a simple model
            self.model = xgb.XGBClassifier(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42
            )
            
            # Initialize label encoders
            self.label_encoders = {
                'product': LabelEncoder(),
                'issue': LabelEncoder(),
                'company': LabelEncoder()
            }
            
            # Fit with dummy data for initialization
            dummy_products = ['credit_card', 'loan', 'mortgage', 'deposit_account', 'other']
            dummy_issues = ['unauthorized_charges', 'billing_dispute', 'service_quality', 'other']
            dummy_companies = ['bank_a', 'bank_b', 'bank_c', 'other']
            
            self.label_encoders['product'].fit(dummy_products)
            self.label_encoders['issue'].fit(dummy_issues)
            self.label_encoders['company'].fit(dummy_companies)
            
            logger.info("Risk model initialized")
            
        except Exception as e:
            logger.error(f"Error initializing risk model: {e}")
            raise
    
    async def extract_features(
        self, 
        db: AsyncSession,
        narrative: str,
        entities: Dict[str, Any],
        classification: Dict[str, str],
        sentiment: Dict[str, Any],
        tenant_id: str,
        user_id: Optional[str] = None
    ) -> Dict[str, float]:
        """Extract features for risk prediction"""
        try:
            features = {}
            
            # Encode categorical features
            product = classification.get('product_category', 'other')
            issue = classification.get('issue_category', 'other')
            company = entities.get('company', 'other')
            
            # Handle unknown categories
            try:
                features['product_encoded'] = self.label_encoders['product'].transform([product])[0]
            except ValueError:
                features['product_encoded'] = self.label_encoders['product'].transform(['other'])[0]
            
            try:
                features['issue_encoded'] = self.label_encoders['issue'].transform([issue])[0]
            except ValueError:
                features['issue_encoded'] = self.label_encoders['issue'].transform(['other'])[0]
            
            try:
                features['company_encoded'] = self.label_encoders['company'].transform([company])[0]
            except ValueError:
                features['company_encoded'] = self.label_encoders['company'].transform(['other'])[0]
            
            # Text features
            features['narrative_length'] = len(narrative)
            features['amount_mentioned'] = 1.0 if entities.get('amount') else 0.0
            
            # Sentiment features
            urgency_map = {'low': 1, 'medium': 2, 'high': 3, 'critical': 4}
            features['urgency_score'] = urgency_map.get(classification.get('urgency_level', 'medium'), 2)
            
            sentiment_map = {'positive': 1, 'neutral': 2, 'negative': 3}
            features['sentiment_score'] = sentiment_map.get(sentiment.get('sentiment', 'neutral'), 2)
            
            # Historical features
            historical_data = await self._get_historical_features(db, tenant_id, user_id, company)
            features.update(historical_data)
            
            return features
            
        except Exception as e:
            logger.error(f"Error extracting features: {e}")
            return {}
    
    async def _get_historical_features(
        self,
        db: AsyncSession,
        tenant_id: str,
        user_id: Optional[str],
        company: str
    ) -> Dict[str, float]:
        """Get historical features for risk assessment"""
        try:
            # Count historical complaints for this user/company
            query = text("""
                SELECT 
                    COUNT(*) as complaint_count,
                    MAX(created_at) as last_complaint_date,
                    AVG(r.risk) as avg_risk
                FROM complaints_raw c
                LEFT JOIN risk_scores r ON c.id = r.complaint_id
                WHERE c.tenant_id = :tenant_id
                AND (c.user_id = :user_id OR c.company = :company)
                AND c.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
            """)
            
            result = await db.execute(query, {
                "tenant_id": tenant_id,
                "user_id": user_id,
                "company": company
            })
            
            row = result.fetchone()
            
            features = {
                'historical_complaints': float(row.complaint_count if row.complaint_count else 0),
                'days_since_last_complaint': 365.0  # Default
            }
            
            if row.last_complaint_date:
                days_diff = (datetime.now() - row.last_complaint_date).days
                features['days_since_last_complaint'] = float(days_diff)
            
            return features
            
        except Exception as e:
            logger.error(f"Error getting historical features: {e}")
            return {'historical_complaints': 0.0, 'days_since_last_complaint': 365.0}
    
    async def predict_risk(
        self,
        db: AsyncSession,
        narrative: str,
        entities: Dict[str, Any],
        classification: Dict[str, str],
        sentiment: Dict[str, Any],
        tenant_id: str,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Predict risk score and category"""
        try:
            # Extract features
            features = await self.extract_features(
                db, narrative, entities, classification, sentiment, tenant_id, user_id
            )
            
            if not features:
                return self._default_risk_assessment()
            
            # Create feature vector
            feature_vector = np.array([[features.get(col, 0.0) for col in self.feature_columns]])
            
            # For now, use a simple rule-based approach since we don't have training data
            risk_score = self._calculate_rule_based_risk(features, sentiment, classification)
            
            # Determine risk category
            if risk_score >= 0.7:
                risk_category = "high"
            elif risk_score >= 0.4:
                risk_category = "medium"
            else:
                risk_category = "low"
            
            # Generate explanation
            factors = self._explain_risk_factors(features, sentiment, classification)
            
            return {
                "risk_score": risk_score,
                "risk_category": risk_category,
                "confidence": 0.85,  # Placeholder
                "factors": factors,
                "model_version": self.model_version
            }
            
        except Exception as e:
            logger.error(f"Error predicting risk: {e}")
            return self._default_risk_assessment()
    
    def _calculate_rule_based_risk(
        self,
        features: Dict[str, float],
        sentiment: Dict[str, Any],
        classification: Dict[str, str]
    ) -> float:
        """Calculate risk using rule-based approach"""
        risk_score = 0.3  # Base risk
        
        # Urgency factor
        urgency_weights = {'low': 0.0, 'medium': 0.1, 'high': 0.2, 'critical': 0.3}
        risk_score += urgency_weights.get(classification.get('urgency_level', 'medium'), 0.1)
        
        # Sentiment factor
        if sentiment.get('sentiment') == 'negative':
            risk_score += 0.2
        if sentiment.get('emotion') == 'angry':
            risk_score += 0.15
        
        # Issue type factor
        high_risk_issues = ['unauthorized_charges', 'fraud', 'discrimination']
        if classification.get('issue_category') in high_risk_issues:
            risk_score += 0.2
        
        # Historical complaints factor
        if features.get('historical_complaints', 0) > 2:
            risk_score += 0.1
        
        # Amount mentioned factor
        if features.get('amount_mentioned', 0) > 0:
            risk_score += 0.1
        
        return min(risk_score, 1.0)
    
    def _explain_risk_factors(
        self,
        features: Dict[str, float],
        sentiment: Dict[str, Any],
        classification: Dict[str, str]
    ) -> Dict[str, Any]:
        """Generate explanation for risk factors"""
        factors = {
            "primary_factors": [],
            "contributing_factors": [],
            "mitigating_factors": []
        }
        
        # Primary factors
        if classification.get('urgency_level') in ['high', 'critical']:
            factors["primary_factors"].append("High urgency complaint")
        
        if sentiment.get('sentiment') == 'negative':
            factors["primary_factors"].append("Negative sentiment detected")
        
        # Contributing factors
        if features.get('historical_complaints', 0) > 1:
            factors["contributing_factors"].append("Multiple previous complaints")
        
        if features.get('amount_mentioned', 0) > 0:
            factors["contributing_factors"].append("Financial amount mentioned")
        
        # Mitigating factors
        if features.get('days_since_last_complaint', 0) > 180:
            factors["mitigating_factors"].append("No recent complaints")
        
        return factors
    
    def _default_risk_assessment(self) -> Dict[str, Any]:
        """Return default risk assessment when prediction fails"""
        return {
            "risk_score": 0.5,
            "risk_category": "medium",
            "confidence": 0.5,
            "factors": {"primary_factors": ["Unable to assess risk"]},
            "model_version": self.model_version
        }


# Global instance
risk_model = RiskModel()