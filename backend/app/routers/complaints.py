"""
Complaint management endpoints
"""
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.core.database import get_db
from app.models.database import ComplaintRaw, User
from app.models.schemas import ComplaintCreate, ComplaintResponse, ComplaintAnalysis
from app.services.auth import get_current_user
from app.agents.workflow import complaint_workflow_graph
from app.services.telemetry import trace_endpoint

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/", response_model=ComplaintResponse)
@trace_endpoint
async def create_complaint(
    complaint: ComplaintCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new complaint and trigger AI analysis"""
    try:
        # Create complaint record
        db_complaint = ComplaintRaw(
            tenant_id=current_user.tenant_id,
            user_id=current_user.id,
            narrative=complaint.narrative,
            product=complaint.product,
            issue=complaint.issue,
            company=complaint.company
        )
        
        db.add(db_complaint)
        await db.flush()  # Get the ID
        await db.commit()
        
        # Trigger LangGraph AI workflow
        try:
            workflow_result = await complaint_workflow_graph.process_complaint(
                complaint_id=db_complaint.id,
                narrative=complaint.narrative,
                tenant_id=current_user.tenant_id,
                user_id=current_user.id
            )
            logger.info(f"Complaint {db_complaint.id} processed successfully")
        except Exception as e:
            logger.error(f"Error processing complaint {db_complaint.id}: {e}")
            # Don't fail the request if AI processing fails
        
        return ComplaintResponse(
            id=db_complaint.id,
            tenant_id=db_complaint.tenant_id,
            user_id=db_complaint.user_id,
            narrative=db_complaint.narrative,
            product=db_complaint.product,
            issue=db_complaint.issue,
            company=db_complaint.company,
            created_at=db_complaint.created_at
        )
        
    except Exception as e:
        logger.error(f"Error creating complaint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create complaint"
        )


@router.get("/", response_model=List[ComplaintResponse])
@trace_endpoint
async def get_complaints(
    skip: int = 0,
    limit: int = 100,
    product: Optional[str] = None,
    issue: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get complaints for current tenant"""
    try:
        query = select(ComplaintRaw).where(
            ComplaintRaw.tenant_id == current_user.tenant_id
        )
        
        # Add filters
        if product:
            query = query.where(ComplaintRaw.product == product)
        if issue:
            query = query.where(ComplaintRaw.issue == issue)
        
        # Add pagination
        query = query.offset(skip).limit(limit).order_by(ComplaintRaw.created_at.desc())
        
        result = await db.execute(query)
        complaints = result.scalars().all()
        
        return [
            ComplaintResponse(
                id=c.id,
                tenant_id=c.tenant_id,
                user_id=c.user_id,
                narrative=c.narrative,
                product=c.product,
                issue=c.issue,
                company=c.company,
                created_at=c.created_at
            )
            for c in complaints
        ]
        
    except Exception as e:
        logger.error(f"Error getting complaints: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve complaints"
        )


@router.get("/{complaint_id}", response_model=ComplaintResponse)
@trace_endpoint
async def get_complaint(
    complaint_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific complaint"""
    try:
        query = select(ComplaintRaw).where(
            and_(
                ComplaintRaw.id == complaint_id,
                ComplaintRaw.tenant_id == current_user.tenant_id
            )
        )
        
        result = await db.execute(query)
        complaint = result.scalar_one_or_none()
        
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found"
            )
        
        return ComplaintResponse(
            id=complaint.id,
            tenant_id=complaint.tenant_id,
            user_id=complaint.user_id,
            narrative=complaint.narrative,
            product=complaint.product,
            issue=complaint.issue,
            company=complaint.company,
            created_at=complaint.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting complaint {complaint_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve complaint"
        )


@router.get("/{complaint_id}/analysis", response_model=ComplaintAnalysis)
@trace_endpoint
async def get_complaint_analysis(
    complaint_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get AI analysis for specific complaint"""
    try:
        # Verify complaint exists and belongs to tenant
        query = select(ComplaintRaw).where(
            and_(
                ComplaintRaw.id == complaint_id,
                ComplaintRaw.tenant_id == current_user.tenant_id
            )
        )
        
        result = await db.execute(query)
        complaint = result.scalar_one_or_none()
        
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found"
            )
        
        # If no analysis exists, trigger it
        if not complaint.labels or not complaint.risk_scores:
            workflow_result = await complaint_workflow_graph.process_complaint(
                complaint_id=complaint_id,
                narrative=complaint.narrative,
                tenant_id=current_user.tenant_id,
                user_id=current_user.id
            )
            
            return ComplaintAnalysis(
                complaint_id=complaint_id,
                entities=workflow_result.get('results', {}).get('entities', {}),
                classification=workflow_result.get('results', {}).get('classification', {}),
                risk_assessment=workflow_result.get('results', {}).get('risk_assessment', {}),
                similar_complaints=workflow_result.get('results', {}).get('similar_complaints', []),
                benchmarks=workflow_result.get('results', {}).get('benchmarks', {})
            )
        
        # Return existing analysis
        latest_label = complaint.labels[-1] if complaint.labels else None
        latest_risk = complaint.risk_scores[-1] if complaint.risk_scores else None
        
        return ComplaintAnalysis(
            complaint_id=complaint_id,
            entities={
                "product": latest_label.product if latest_label else None,
                "issue": latest_label.issue if latest_label else None,
                "company": latest_label.company if latest_label else None
            },
            classification={
                "product_category": latest_label.product if latest_label else None,
                "issue_category": latest_label.issue if latest_label else None
            },
            risk_assessment={
                "risk_score": latest_risk.risk if latest_risk else None,
                "risk_category": latest_risk.category if latest_risk else None,
                "factors": latest_risk.factors if latest_risk else {}
            },
            similar_complaints=[],
            benchmarks={}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting complaint analysis {complaint_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve complaint analysis"
        )