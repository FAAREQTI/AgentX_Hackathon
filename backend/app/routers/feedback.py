"""
Feedback collection endpoints
"""
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc, func

from app.core.database import get_db
from app.models.database import Feedback, ComplaintRaw, User
from app.models.schemas import FeedbackCreate, FeedbackResponse
from app.services.auth import get_current_user
from app.services.telemetry import trace_endpoint

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/", response_model=FeedbackResponse)
@trace_endpoint
async def create_feedback(
    feedback: FeedbackCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create feedback for a complaint"""
    try:
        # Verify complaint exists and belongs to tenant
        complaint_query = select(ComplaintRaw).where(
            and_(
                ComplaintRaw.id == feedback.complaint_id,
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
        
        # Create feedback
        db_feedback = Feedback(
            complaint_id=feedback.complaint_id,
            tenant_id=current_user.tenant_id,
            rating=feedback.rating,
            comment=feedback.comment
        )
        
        db.add(db_feedback)
        await db.commit()
        await db.refresh(db_feedback)
        
        return FeedbackResponse(
            id=db_feedback.id,
            complaint_id=db_feedback.complaint_id,
            tenant_id=db_feedback.tenant_id,
            rating=db_feedback.rating,
            comment=db_feedback.comment,
            created_at=db_feedback.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating feedback: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create feedback"
        )


@router.get("/", response_model=List[FeedbackResponse])
@trace_endpoint
async def get_feedback(
    skip: int = 0,
    limit: int = 100,
    rating: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get feedback for tenant"""
    try:
        query = select(Feedback).where(
            Feedback.tenant_id == current_user.tenant_id
        )
        
        if rating:
            query = query.where(Feedback.rating == rating)
        
        query = query.offset(skip).limit(limit).order_by(desc(Feedback.created_at))
        
        result = await db.execute(query)
        feedback_items = result.scalars().all()
        
        return [
            FeedbackResponse(
                id=f.id,
                complaint_id=f.complaint_id,
                tenant_id=f.tenant_id,
                rating=f.rating,
                comment=f.comment,
                created_at=f.created_at
            )
            for f in feedback_items
        ]
        
    except Exception as e:
        logger.error(f"Error getting feedback: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve feedback"
        )


@router.get("/{complaint_id}", response_model=List[FeedbackResponse])
@trace_endpoint
async def get_feedback_by_complaint(
    complaint_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get feedback for specific complaint"""
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
        
        # Get feedback for complaint
        feedback_query = select(Feedback).where(
            and_(
                Feedback.complaint_id == complaint_id,
                Feedback.tenant_id == current_user.tenant_id
            )
        ).order_by(desc(Feedback.created_at))
        
        result = await db.execute(feedback_query)
        feedback_items = result.scalars().all()
        
        return [
            FeedbackResponse(
                id=f.id,
                complaint_id=f.complaint_id,
                tenant_id=f.tenant_id,
                rating=f.rating,
                comment=f.comment,
                created_at=f.created_at
            )
            for f in feedback_items
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting feedback for complaint {complaint_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve feedback"
        )


@router.get("/analytics/summary")
@trace_endpoint
async def get_feedback_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get feedback analytics summary"""
    try:
        # Average rating
        avg_rating_query = select(func.avg(Feedback.rating)).where(
            Feedback.tenant_id == current_user.tenant_id
        )
        avg_rating_result = await db.execute(avg_rating_query)
        avg_rating = avg_rating_result.scalar() or 0.0
        
        # Rating distribution
        rating_dist_query = select(
            Feedback.rating,
            func.count(Feedback.id).label('count')
        ).where(
            Feedback.tenant_id == current_user.tenant_id
        ).group_by(Feedback.rating).order_by(Feedback.rating)
        
        rating_dist_result = await db.execute(rating_dist_query)
        rating_distribution = {
            str(row.rating): row.count for row in rating_dist_result
        }
        
        # Total feedback count
        total_count_query = select(func.count(Feedback.id)).where(
            Feedback.tenant_id == current_user.tenant_id
        )
        total_count_result = await db.execute(total_count_query)
        total_count = total_count_result.scalar() or 0
        
        # Satisfaction rate (ratings 4-5)
        satisfied_count_query = select(func.count(Feedback.id)).where(
            and_(
                Feedback.tenant_id == current_user.tenant_id,
                Feedback.rating >= 4
            )
        )
        satisfied_count_result = await db.execute(satisfied_count_query)
        satisfied_count = satisfied_count_result.scalar() or 0
        
        satisfaction_rate = (satisfied_count / max(total_count, 1)) * 100
        
        return {
            "average_rating": round(avg_rating, 2),
            "total_feedback": total_count,
            "satisfaction_rate": round(satisfaction_rate, 2),
            "rating_distribution": rating_distribution,
            "insights": {
                "most_common_rating": max(rating_distribution.items(), key=lambda x: x[1])[0] if rating_distribution else "N/A",
                "improvement_needed": avg_rating < 3.5,
                "performance_level": "excellent" if avg_rating >= 4.5 else "good" if avg_rating >= 3.5 else "needs_improvement"
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting feedback analytics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve feedback analytics"
        )