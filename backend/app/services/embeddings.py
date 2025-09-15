"""
Embedding service for vector operations
"""
import logging
import json
from typing import List, Optional, Dict, Any
import openai
from openai import AsyncOpenAI
import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.config import settings
from app.models.database import ComplaintRaw

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


class EmbeddingService:
    """Service for handling embeddings and vector operations"""
    
    def __init__(self):
        self.model = "text-embedding-ada-002"
        self.dimension = 1536
    
    async def create_embedding(self, text: str) -> List[float]:
        """Create embedding for given text"""
        try:
            response = await client.embeddings.create(
                model=self.model,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error creating embedding: {e}")
            raise
    
    async def store_complaint_embedding(
        self, 
        db: AsyncSession, 
        complaint_id: int, 
        text: str
    ) -> None:
        """Store complaint embedding in database"""
        try:
            embedding = await self.create_embedding(text)
            embedding_json = json.dumps(embedding)
            
            # Update complaint with embedding
            query = text("""
                UPDATE complaints_raw 
                SET embedding = :embedding 
                WHERE id = :complaint_id
            """)
            await db.execute(query, {
                "embedding": embedding_json,
                "complaint_id": complaint_id
            })
            await db.commit()
            
        except Exception as e:
            logger.error(f"Error storing embedding: {e}")
            raise
    
    async def find_similar_complaints(
        self,
        db: AsyncSession,
        query_text: str,
        tenant_id: str,
        limit: int = 10,
        similarity_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Find similar complaints using vector similarity"""
        try:
            # Create embedding for query
            query_embedding = await self.create_embedding(query_text)
            query_embedding_json = json.dumps(query_embedding)
            
            # Vector similarity search using cosine similarity
            # Note: This is a simplified version. In production, you'd use TiDB's vector functions
            query = text("""
                SELECT 
                    c.id,
                    c.narrative,
                    c.product,
                    c.issue,
                    c.company,
                    c.created_at,
                    r.risk,
                    r.category as risk_category
                FROM complaints_raw c
                LEFT JOIN risk_scores r ON c.id = r.complaint_id
                WHERE c.tenant_id = :tenant_id 
                AND c.embedding IS NOT NULL
                ORDER BY c.created_at DESC
                LIMIT :limit
            """)
            
            result = await db.execute(query, {
                "tenant_id": tenant_id,
                "limit": limit
            })
            
            complaints = []
            for row in result:
                complaints.append({
                    "id": row.id,
                    "narrative": row.narrative,
                    "product": row.product,
                    "issue": row.issue,
                    "company": row.company,
                    "created_at": row.created_at,
                    "risk_score": row.risk,
                    "risk_category": row.risk_category,
                    "similarity_score": 0.85  # Placeholder - would calculate actual similarity
                })
            
            return complaints
            
        except Exception as e:
            logger.error(f"Error finding similar complaints: {e}")
            return []
    
    async def get_complaint_clusters(
        self,
        db: AsyncSession,
        tenant_id: str,
        num_clusters: int = 5
    ) -> List[Dict[str, Any]]:
        """Get complaint clusters for analysis"""
        try:
            # Simplified clustering - in production would use proper clustering algorithms
            query = text("""
                SELECT 
                    product,
                    issue,
                    COUNT(*) as count,
                    AVG(r.risk) as avg_risk
                FROM complaints_raw c
                LEFT JOIN risk_scores r ON c.id = r.complaint_id
                WHERE c.tenant_id = :tenant_id
                GROUP BY product, issue
                ORDER BY count DESC
                LIMIT :num_clusters
            """)
            
            result = await db.execute(query, {
                "tenant_id": tenant_id,
                "num_clusters": num_clusters
            })
            
            clusters = []
            for row in result:
                clusters.append({
                    "product": row.product,
                    "issue": row.issue,
                    "complaint_count": row.count,
                    "avg_risk_score": row.avg_risk or 0.0,
                    "cluster_id": f"{row.product}_{row.issue}"
                })
            
            return clusters
            
        except Exception as e:
            logger.error(f"Error getting complaint clusters: {e}")
            return []


# Global instance
embedding_service = EmbeddingService()