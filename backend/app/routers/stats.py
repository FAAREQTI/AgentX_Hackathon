"""
Statistics and benchmarking endpoints
"""
import logging
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, text

from app.core.database import get_db
from app.models.database import ComplaintRaw, RiskScore, Feedback, User
from app.models.schemas import StatsQuery, ComplaintStats, BenchmarkData
from app.services.auth import get_current_user
from app.services.telemetry import trace_endpoint

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=ComplaintStats)
@trace_endpoint
async def get_complaint_stats(
    start_date: Optional[datetime] = Query(None, description="Start date for statistics"),
    end_date: Optional[datetime] = Query(None, description="End date for statistics"),
    product: Optional[str] = Query(None, description="Filter by product"),
    issue: Optional[str] = Query(None, description="Filter by issue"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get complaint statistics for tenant"""
    try:
        # Set default date range if not provided
        if not end_date:
            end_date = datetime.now()
        if not start_date:
            start_date = end_date - timedelta(days=30)
        
        # Base query with tenant filter
        base_query = select(ComplaintRaw).where(
            and_(
                ComplaintRaw.tenant_id == current_user.tenant_id,
                ComplaintRaw.created_at >= start_date,
                ComplaintRaw.created_at <= end_date
            )
        )
        
        # Add filters
        if product:
            base_query = base_query.where(ComplaintRaw.product == product)
        if issue:
            base_query = base_query.where(ComplaintRaw.issue == issue)
        
        # Get total complaints
        total_result = await db.execute(
            select(func.count(ComplaintRaw.id)).select_from(base_query.subquery())
        )
        total_complaints = total_result.scalar() or 0
        
        # Get average resolution time (mock data for now)
        avg_resolution_time = 2.3  # hours
        
        # Get satisfaction rate from feedback
        satisfaction_query = select(func.avg(Feedback.rating)).where(
            and_(
                Feedback.tenant_id == current_user.tenant_id,
                Feedback.created_at >= start_date,
                Feedback.created_at <= end_date
            )
        )
        satisfaction_result = await db.execute(satisfaction_query)
        avg_rating = satisfaction_result.scalar() or 4.0
        satisfaction_rate = (avg_rating / 5.0) * 100
        
        # Get high risk percentage
        high_risk_query = select(func.count(RiskScore.id)).where(
            and_(
                RiskScore.tenant_id == current_user.tenant_id,
                RiskScore.category == "high",
                RiskScore.created_at >= start_date,
                RiskScore.created_at <= end_date
            )
        )
        high_risk_result = await db.execute(high_risk_query)
        high_risk_count = high_risk_result.scalar() or 0
        high_risk_percentage = (high_risk_count / max(total_complaints, 1)) * 100
        
        # Get top issues
        top_issues_query = select(
            ComplaintRaw.issue,
            func.count(ComplaintRaw.id).label('count')
        ).where(
            and_(
                ComplaintRaw.tenant_id == current_user.tenant_id,
                ComplaintRaw.created_at >= start_date,
                ComplaintRaw.created_at <= end_date
            )
        ).group_by(ComplaintRaw.issue).order_by(func.count(ComplaintRaw.id).desc()).limit(5)
        
        top_issues_result = await db.execute(top_issues_query)
        top_issues = [
            {"issue": row.issue or "Unknown", "count": row.count}
            for row in top_issues_result
        ]
        
        # Generate trends (mock data)
        trends = {
            "daily_volume": [
                {"date": (start_date + timedelta(days=i)).isoformat(), "count": 10 + i % 5}
                for i in range((end_date - start_date).days + 1)
            ],
            "resolution_time_trend": [
                {"date": (start_date + timedelta(days=i)).isoformat(), "avg_time": 2.3 + (i % 3) * 0.1}
                for i in range((end_date - start_date).days + 1)
            ]
        }
        
        return ComplaintStats(
            total_complaints=total_complaints,
            avg_resolution_time=avg_resolution_time,
            satisfaction_rate=satisfaction_rate,
            high_risk_percentage=high_risk_percentage,
            top_issues=top_issues,
            trends=trends
        )
        
    except Exception as e:
        logger.error(f"Error getting complaint stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve statistics"
        )


@router.get("/benchmarks", response_model=BenchmarkData)
@trace_endpoint
async def get_benchmarks(
    tenant_id: Optional[str] = Query(None, description="Specific tenant for comparison"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get benchmarking data comparing tenant performance"""
    try:
        # For now, return mock benchmarking data
        # In production, this would query across tenants with proper permissions
        
        tenant_performance = {
            "avg_resolution_time": 2.1,
            "satisfaction_rate": 96.2,
            "high_risk_rate": 12.5,
            "complaint_volume": 1247,
            "resolution_success_rate": 89.3
        }
        
        industry_average = {
            "avg_resolution_time": 3.2,
            "satisfaction_rate": 87.5,
            "high_risk_rate": 18.7,
            "complaint_volume": 2100,
            "resolution_success_rate": 82.1
        }
        
        peer_comparison = [
            {
                "tenant_name": "Bank A",
                "avg_resolution_time": 2.1,
                "satisfaction_rate": 96.2,
                "rank": 1
            },
            {
                "tenant_name": "Bank B", 
                "avg_resolution_time": 2.8,
                "satisfaction_rate": 91.5,
                "rank": 2
            },
            {
                "tenant_name": "Bank C",
                "avg_resolution_time": 3.5,
                "satisfaction_rate": 85.2,
                "rank": 3
            }
        ]
        
        return BenchmarkData(
            tenant_performance=tenant_performance,
            industry_average=industry_average,
            peer_comparison=peer_comparison
        )
        
    except Exception as e:
        logger.error(f"Error getting benchmarks: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve benchmarks"
        )


@router.get("/trends")
@trace_endpoint
async def get_trends(
    days: int = Query(30, description="Number of days for trend analysis"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get trend analysis for complaints"""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Daily complaint volume trend
        daily_volume_query = text("""
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count
            FROM complaints_raw 
            WHERE tenant_id = :tenant_id 
            AND created_at >= :start_date 
            AND created_at <= :end_date
            GROUP BY DATE(created_at)
            ORDER BY date
        """)
        
        result = await db.execute(daily_volume_query, {
            "tenant_id": current_user.tenant_id,
            "start_date": start_date,
            "end_date": end_date
        })
        
        daily_volume = [
            {"date": row.date.isoformat(), "count": row.count}
            for row in result
        ]
        
        # Risk distribution trend
        risk_trend_query = text("""
            SELECT 
                DATE(r.created_at) as date,
                r.category,
                COUNT(*) as count
            FROM risk_scores r
            WHERE r.tenant_id = :tenant_id 
            AND r.created_at >= :start_date 
            AND r.created_at <= :end_date
            GROUP BY DATE(r.created_at), r.category
            ORDER BY date, r.category
        """)
        
        risk_result = await db.execute(risk_trend_query, {
            "tenant_id": current_user.tenant_id,
            "start_date": start_date,
            "end_date": end_date
        })
        
        risk_trends = {}
        for row in risk_result:
            date_str = row.date.isoformat()
            if date_str not in risk_trends:
                risk_trends[date_str] = {}
            risk_trends[date_str][row.category] = row.count
        
        return {
            "daily_volume": daily_volume,
            "risk_distribution": risk_trends,
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": days
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting trends: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve trends"
        )