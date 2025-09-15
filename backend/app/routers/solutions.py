"""
Solution and letter generation endpoints
"""
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc

from app.core.database import get_db
from app.models.database import Solution, ComplaintRaw, User
from app.models.schemas import SolutionCreate, SolutionResponse
from app.services.auth import get_current_user
from app.services.telemetry import trace_endpoint

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/", response_model=SolutionResponse)
@trace_endpoint
async def create_solution(
    solution: SolutionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new solution for a complaint"""
    try:
        # Verify complaint exists and belongs to tenant
        complaint_query = select(ComplaintRaw).where(
            and_(
                ComplaintRaw.id == solution.complaint_id,
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
        
        # Create solution
        db_solution = Solution(
            complaint_id=solution.complaint_id,
            tenant_id=current_user.tenant_id,
            solution_text=solution.solution_text,
            resolution_strategy=solution.resolution_strategy
        )
        
        db.add(db_solution)
        await db.commit()
        await db.refresh(db_solution)
        
        return SolutionResponse(
            id=db_solution.id,
            complaint_id=db_solution.complaint_id,
            tenant_id=db_solution.tenant_id,
            solution_text=db_solution.solution_text,
            resolution_strategy=db_solution.resolution_strategy,
            created_at=db_solution.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating solution: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create solution"
        )


@router.get("/", response_model=List[SolutionResponse])
@trace_endpoint
async def get_solutions(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get solutions for tenant"""
    try:
        query = select(Solution).where(
            Solution.tenant_id == current_user.tenant_id
        ).offset(skip).limit(limit).order_by(desc(Solution.created_at))
        
        result = await db.execute(query)
        solutions = result.scalars().all()
        
        return [
            SolutionResponse(
                id=s.id,
                complaint_id=s.complaint_id,
                tenant_id=s.tenant_id,
                solution_text=s.solution_text,
                resolution_strategy=s.resolution_strategy,
                created_at=s.created_at
            )
            for s in solutions
        ]
        
    except Exception as e:
        logger.error(f"Error getting solutions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve solutions"
        )


@router.get("/{complaint_id}", response_model=SolutionResponse)
@trace_endpoint
async def get_solution_by_complaint(
    complaint_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get solution for specific complaint"""
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
        
        # Get latest solution
        solution_query = select(Solution).where(
            and_(
                Solution.complaint_id == complaint_id,
                Solution.tenant_id == current_user.tenant_id
            )
        ).order_by(desc(Solution.created_at)).limit(1)
        
        result = await db.execute(solution_query)
        solution = result.scalar_one_or_none()
        
        if not solution:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Solution not found"
            )
        
        return SolutionResponse(
            id=solution.id,
            complaint_id=solution.complaint_id,
            tenant_id=solution.tenant_id,
            solution_text=solution.solution_text,
            resolution_strategy=solution.resolution_strategy,
            created_at=solution.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting solution for complaint {complaint_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve solution"
        )


@router.get("/{complaint_id}/letter")
@trace_endpoint
async def get_solution_letter(
    complaint_id: int,
    format: str = "text",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get formatted solution letter for complaint"""
    try:
        # Get solution
        solution_query = select(Solution, ComplaintRaw).join(
            ComplaintRaw, Solution.complaint_id == ComplaintRaw.id
        ).where(
            and_(
                Solution.complaint_id == complaint_id,
                Solution.tenant_id == current_user.tenant_id
            )
        ).order_by(desc(Solution.created_at)).limit(1)
        
        result = await db.execute(solution_query)
        solution_data = result.first()
        
        if not solution_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Solution not found"
            )
        
        solution, complaint = solution_data
        
        # Format letter based on requested format
        if format == "pdf":
            # In production, generate PDF using reportlab or similar
            return {
                "format": "pdf",
                "download_url": f"/api/v1/solutions/{complaint_id}/letter.pdf",
                "message": "PDF generation would be implemented here"
            }
        elif format == "html":
            html_content = f"""
            <html>
            <head><title>Resolution Letter - Complaint #{complaint_id}</title></head>
            <body>
                <h1>Resolution Letter</h1>
                <p><strong>Complaint ID:</strong> {complaint_id}</p>
                <p><strong>Date:</strong> {solution.created_at.strftime('%B %d, %Y')}</p>
                <hr>
                <div>{solution.solution_text}</div>
                <hr>
                <p><strong>Resolution Strategy:</strong> {solution.resolution_strategy}</p>
            </body>
            </html>
            """
            return {
                "format": "html",
                "content": html_content
            }
        else:
            # Default text format
            return {
                "format": "text",
                "content": solution.solution_text,
                "resolution_strategy": solution.resolution_strategy,
                "complaint_id": complaint_id,
                "created_at": solution.created_at.isoformat()
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting solution letter for complaint {complaint_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve solution letter"
        )