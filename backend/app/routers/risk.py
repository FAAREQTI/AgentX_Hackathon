"""
Risk assessment endpoints
"""
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc

from app.core.database import get_db
from app.models.database import RiskScore, ComplaintRaw, User
from app.models.schemas import RiskAssessment
from app.services.auth import get_current_user
from app.services.telemetry import trace_endpoint

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=List[RiskAssessment])
@trace_endpoint
async def get_risk_assessments(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get risk assessments for tenant"""
    try:
        query = select(RiskScore).where(
            RiskScore.tenant_id == current_user.tenant_id
        )
        
        if category:
            query = query.where(RiskScore.category == category)
        
        query = query.offset(skip).limit(limit).order_by(desc(RiskScore.created_at))
        
        result = await db.execute(query)
        risk_scores = result.scalars().all()
        
        return [
            RiskAssessment(
                complaint_id=rs.complaint_id,
                risk_score=rs.risk,
                risk_category=rs.category,
                factors=rs.factors or {},
                model_version=rs.model_version,
                confidence=rs.confidence or 0.85
            )
            for rs in risk_scores
        ]
        
    except Exception as e:
        logger.error(f"Error getting risk assessments: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve risk assessments"
        )


@router.get("/{complaint_id}", response_model=RiskAssessment)
@trace_endpoint
async def get_risk_assessment(
    complaint_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get risk assessment for specific complaint"""
    try:
        # Verify complaint belongs to tenant
        complaint_query = select(ComplaintRaw).where(
            and_(
                ComplaintRaw.id == complaint_id,
                ComplaintRaw.tenant_id == current_user.tenant_id
            )
        )
        complaint_result = await db.execute(complaint_query)
        complaint = complaint_result.scalar_one_or_none()
        
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found"
            )
        
        # Get latest risk assessment
        risk_query = select(RiskScore).where(
            and_(
                RiskScore.complaint_id == complaint_id,
                RiskScore.tenant_id == current_user.tenant_id
            )
        ).order_by(desc(RiskScore.created_at)).limit(1)
        
        risk_result = await db.execute(risk_query)
        risk_score = risk_result.scalar_one_or_none()
        
        if not risk_score:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Risk assessment not found"
            )
        
        return RiskAssessment(
            complaint_id=risk_score.complaint_id,
            risk_score=risk_score.risk,
            risk_category=risk_score.category,
            factors=risk_score.factors or {},
            model_version=risk_score.model_version,
            confidence=risk_score.confidence or 0.85
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting risk assessment {complaint_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve risk assessment"
        )


@router.get("/high-risk/alerts")
@trace_endpoint
async def get_high_risk_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get high-risk complaint alerts"""
    try:
        # Get high-risk complaints from last 24 hours
        from datetime import datetime, timedelta
        
        query = select(RiskScore, ComplaintRaw).join(
            ComplaintRaw, RiskScore.complaint_id == ComplaintRaw.id
        ).where(
            and_(
                RiskScore.tenant_id == current_user.tenant_id,
                RiskScore.category == "high",
                RiskScore.created_at >= datetime.now() - timedelta(hours=24)
            )
        ).order_by(desc(RiskScore.risk))
        
        result = await db.execute(query)
        high_risk_items = result.all()
        
        alerts = []
        for risk_score, complaint in high_risk_items:
            alerts.append({
                "complaint_id": complaint.id,
                "narrative_preview": complaint.narrative[:100] + "..." if len(complaint.narrative) > 100 else complaint.narrative,
                "risk_score": risk_score.risk,
                "risk_category": risk_score.category,
                "factors": risk_score.factors,
                "created_at": risk_score.created_at.isoformat(),
                "urgency": "immediate" if risk_score.risk >= 0.9 else "high"
            })
        
        return {
            "alerts": alerts,
            "total_count": len(alerts),
            "critical_count": len([a for a in alerts if a["urgency"] == "immediate"]),
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting high-risk alerts: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve high-risk alerts"
        )