import logging
import time
import json
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from langchain_core.messages import AIMessage

from app.services.embeddings import embedding_service
from app.models.schemas import ComplaintState

logger = logging.getLogger(__name__)


class StatsFinderAgent:

    def __init__(self):
        self.similarity_threshold = 0.7
        self.benchmark_cache = {}

    async def process(
        self, state: ComplaintState, db: AsyncSession = None
    ) -> ComplaintState:
        """Process complaint through stats and benchmarking pipeline"""
        start_time = time.time()

        try:
            logger.info(f"Starting stats_finder for complaint {state['complaint_id']}")

            # Step 1: Find similar complaints using vector search
            similar_complaints = await self._find_similar_complaints(state, db)

            # Step 2: Generate OLAP benchmarks
            benchmarks = await self._generate_benchmarks(state, db)

            # Step 3: Calculate industry comparisons
            industry_stats = await self._get_industry_comparisons(state, db)

            # Step 4: Trend analysis
            trends = await self._analyze_trends(state, db)

            # Step 5: Success pattern analysis
            success_patterns = await self._analyze_success_patterns(
                similar_complaints, db
            )

            # Compile comprehensive stats
            comprehensive_stats = {
                "similar_complaints": similar_complaints,
                "benchmarks": benchmarks,
                "industry_comparisons": industry_stats,
                "trends": trends,
                "success_patterns": success_patterns,
                "analysis_metadata": {
                    "total_similar_found": len(similar_complaints),
                    "benchmark_confidence": benchmarks.get("confidence", 0.0),
                    "trend_period_days": 90,
                    "analysis_timestamp": time.time(),
                },
            }

            # Update state
            state["similar_complaints"] = similar_complaints
            state["benchmarks"] = comprehensive_stats
            state["current_agent"] = "stats_finder"

            # Add processing step
            execution_time = time.time() - start_time
            step = {
                "agent": "stats_finder",
                "status": "success",
                "execution_time": execution_time,
                "output": {
                    "similar_complaints_found": len(similar_complaints),
                    "benchmark_categories": len(benchmarks),
                    "industry_comparisons": len(industry_stats),
                    "success_rate": success_patterns.get("overall_success_rate", 0.0),
                },
            }
            state["processing_steps"].append(step)

            # Add message
            message = AIMessage(
                content=f"📊 Statistical Analysis Complete!\n"
                f"🔍 Similar Complaints: {len(similar_complaints)} found\n"
                f"📈 Success Rate: {success_patterns.get('overall_success_rate', 0.0):.1%}\n"
                f"⏱️ Avg Resolution Time: {benchmarks.get('avg_resolution_time', 'N/A')}\n"
                f"🏆 Industry Ranking: {industry_stats.get('tenant_ranking', 'N/A')}\n"
                f"📋 Recommended Actions: {len(benchmarks.get('recommended_actions', []))} identified"
            )
            state["messages"].append(message)

            logger.info(f"Stats finder completed in {execution_time:.2f}s")

        except Exception as e:
            logger.error(f"Error in stats_finder: {e}")
            state["errors"].append(f"stats_finder: {str(e)}")

            # Add failed step
            execution_time = time.time() - start_time
            step = {
                "agent": "stats_finder",
                "status": "failed",
                "execution_time": execution_time,
                "error": str(e),
            }
            state["processing_steps"].append(step)

        return state

    async def _find_similar_complaints(
        self, state: ComplaintState, db: AsyncSession
    ) -> List[Dict[str, Any]]:
        """Find similar complaints using vector similarity"""
        try:
            if not db:
                return self._get_mock_similar_complaints()

            narrative = state.get("redacted_narrative", state["narrative"])

            # Use embedding service for vector search
            similar_complaints = await embedding_service.find_similar_complaints(
                db, narrative, state["tenant_id"], limit=10
            )

            # Enrich with resolution outcomes
            enriched_complaints = []
            for complaint in similar_complaints:
                enriched = complaint.copy()

                # Get resolution outcome
                resolution_query = text(
                    """
                    SELECT s.solution_text, s.resolution_strategy, f.rating
                    FROM solutions s
                    LEFT JOIN feedback f ON s.complaint_id = f.complaint_id
                    WHERE s.complaint_id = :complaint_id
                    ORDER BY s.created_at DESC
                    LIMIT 1
                """
                )

                result = await db.execute(
                    resolution_query, {"complaint_id": complaint["id"]}
                )
                resolution = result.fetchone()

                if resolution:
                    enriched.update(
                        {
                            "resolution_strategy": resolution.resolution_strategy,
                            "customer_satisfaction": resolution.rating,
                            "resolution_available": True,
                        }
                    )
                else:
                    enriched.update(
                        {
                            "resolution_strategy": "Pending",
                            "customer_satisfaction": None,
                            "resolution_available": False,
                        }
                    )

                enriched_complaints.append(enriched)

            return enriched_complaints

        except Exception as e:
            logger.error(f"Error finding similar complaints: {e}")
            return self._get_mock_similar_complaints()

    async def _generate_benchmarks(
        self, state: ComplaintState, db: AsyncSession
    ) -> Dict[str, Any]:
        """Generate benchmarking data using OLAP queries"""
        try:
            if not db:
                return self._get_mock_benchmarks()

            classification = state.get("classification", {})
            tenant_id = state["tenant_id"]

            # OLAP query for benchmarks
            benchmark_query = text(
                """
                SELECT 
                    COUNT(*) as total_complaints,
                    AVG(TIMESTAMPDIFF(HOUR, c.created_at, s.created_at)) as avg_resolution_hours,
                    AVG(f.rating) as avg_satisfaction,
                    COUNT(CASE WHEN r.category = 'high' THEN 1 END) / COUNT(*) * 100 as high_risk_percentage,
                    COUNT(CASE WHEN f.rating >= 4 THEN 1 END) / COUNT(f.rating) * 100 as success_rate
                FROM complaints_raw c
                LEFT JOIN solutions s ON c.id = s.complaint_id
                LEFT JOIN feedback f ON c.id = f.complaint_id
                LEFT JOIN risk_scores r ON c.id = r.complaint_id
                WHERE c.tenant_id = :tenant_id
                AND c.product = :product
                AND c.issue = :issue
                AND c.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
            """
            )

            result = await db.execute(
                benchmark_query,
                {
                    "tenant_id": tenant_id,
                    "product": classification.get("product_category"),
                    "issue": classification.get("issue_category"),
                },
            )

            benchmark_data = result.fetchone()

            if benchmark_data:
                benchmarks = {
                    "total_similar_complaints": benchmark_data.total_complaints or 0,
                    "avg_resolution_time": f"{benchmark_data.avg_resolution_hours or 24:.1f}h",
                    "avg_satisfaction_score": benchmark_data.avg_satisfaction or 3.5,
                    "high_risk_percentage": benchmark_data.high_risk_percentage or 15.0,
                    "success_rate": benchmark_data.success_rate or 75.0,
                    "confidence": 0.85 if benchmark_data.total_complaints > 10 else 0.5,
                    "recommended_actions": self._generate_recommendations(
                        benchmark_data
                    ),
                }
            else:
                benchmarks = self._get_mock_benchmarks()

            return benchmarks

        except Exception as e:
            logger.error(f"Error generating benchmarks: {e}")
            return self._get_mock_benchmarks()

    async def _get_industry_comparisons(
        self, state: ComplaintState, db: AsyncSession
    ) -> Dict[str, Any]:
        """Get industry-wide comparison data"""
        try:
            # Mock industry data - in production, this would query across tenants
            # with proper permissions and anonymization

            classification = state.get("classification", {})

            industry_stats = {
                "tenant_performance": {
                    "avg_resolution_time": 24.5,
                    "satisfaction_rate": 87.2,
                    "success_rate": 89.1,
                },
                "industry_average": {
                    "avg_resolution_time": 32.1,
                    "satisfaction_rate": 82.5,
                    "success_rate": 78.3,
                },
                "tenant_ranking": "Top 15%",
                "peer_comparison": [
                    {
                        "metric": "Resolution Time",
                        "tenant_score": 24.5,
                        "industry_avg": 32.1,
                        "percentile": 85,
                    },
                    {
                        "metric": "Satisfaction",
                        "tenant_score": 87.2,
                        "industry_avg": 82.5,
                        "percentile": 78,
                    },
                    {
                        "metric": "Success Rate",
                        "tenant_score": 89.1,
                        "industry_avg": 78.3,
                        "percentile": 92,
                    },
                ],
                "improvement_opportunities": [
                    "Consider automated initial response for faster acknowledgment",
                    "Implement proactive communication for high-value customers",
                    "Enhance first-call resolution training",
                ],
            }

            return industry_stats

        except Exception as e:
            logger.error(f"Error getting industry comparisons: {e}")
            return {"error": str(e)}

    async def _analyze_trends(
        self, state: ComplaintState, db: AsyncSession
    ) -> Dict[str, Any]:
        """Analyze trends for similar complaint types"""
        try:
            if not db:
                return self._get_mock_trends()

            classification = state.get("classification", {})

            # Trend analysis query
            trend_query = text(
                """
                SELECT 
                    DATE(c.created_at) as complaint_date,
                    COUNT(*) as daily_count,
                    AVG(r.risk) as avg_daily_risk
                FROM complaints_raw c
                LEFT JOIN risk_scores r ON c.id = r.complaint_id
                WHERE c.tenant_id = :tenant_id
                AND c.product = :product
                AND c.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY DATE(c.created_at)
                ORDER BY complaint_date DESC
            """
            )

            result = await db.execute(
                trend_query,
                {
                    "tenant_id": state["tenant_id"],
                    "product": classification.get("product_category"),
                },
            )

            trend_data = result.fetchall()

            trends = {
                "daily_volume": [
                    {
                        "date": row.complaint_date.isoformat(),
                        "count": row.daily_count,
                        "avg_risk": (
                            float(row.avg_daily_risk) if row.avg_daily_risk else 0.0
                        ),
                    }
                    for row in trend_data
                ],
                "trend_analysis": self._analyze_trend_patterns(trend_data),
                "volume_forecast": self._forecast_volume(trend_data),
            }

            return trends

        except Exception as e:
            logger.error(f"Error analyzing trends: {e}")
            return self._get_mock_trends()

    async def _analyze_success_patterns(
        self, similar_complaints: List[Dict[str, Any]], db: AsyncSession
    ) -> Dict[str, Any]:
        """Analyze success patterns from similar complaints"""
        try:
            if not similar_complaints:
                return {"overall_success_rate": 0.75, "patterns": []}

            # Analyze resolution strategies
            successful_resolutions = [
                c for c in similar_complaints if c.get("customer_satisfaction", 0) >= 4
            ]

            success_rate = len(successful_resolutions) / len(similar_complaints)

            # Extract common success patterns
            strategy_counts = {}
            for complaint in successful_resolutions:
                strategy = complaint.get("resolution_strategy", "unknown")
                strategy_counts[strategy] = strategy_counts.get(strategy, 0) + 1

            # Sort by frequency
            top_strategies = sorted(
                strategy_counts.items(), key=lambda x: x[1], reverse=True
            )[:3]

            patterns = {
                "overall_success_rate": success_rate,
                "total_analyzed": len(similar_complaints),
                "successful_resolutions": len(successful_resolutions),
                "top_strategies": [
                    {
                        "strategy": strategy,
                        "success_count": count,
                        "success_rate": count / len(similar_complaints),
                    }
                    for strategy, count in top_strategies
                ],
                "avg_resolution_time": sum(
                    c.get("resolution_time_hours", 24) for c in successful_resolutions
                )
                / max(len(successful_resolutions), 1),
                "recommendations": self._generate_strategy_recommendations(
                    top_strategies
                ),
            }

            return patterns

        except Exception as e:
            logger.error(f"Error analyzing success patterns: {e}")
            return {"overall_success_rate": 0.75, "error": str(e)}

    def _generate_recommendations(self, benchmark_data) -> List[str]:
        """Generate actionable recommendations based on benchmarks"""
        recommendations = []

        if benchmark_data and benchmark_data.avg_resolution_hours:
            if benchmark_data.avg_resolution_hours > 48:
                recommendations.append(
                    "Consider streamlining resolution process - current time above industry standard"
                )

            if (
                benchmark_data.avg_satisfaction
                and benchmark_data.avg_satisfaction < 3.5
            ):
                recommendations.append(
                    "Focus on customer communication - satisfaction below target"
                )

            if (
                benchmark_data.high_risk_percentage
                and benchmark_data.high_risk_percentage > 20
            ):
                recommendations.append(
                    "Implement proactive risk mitigation - high percentage of escalations"
                )

        if not recommendations:
            recommendations = [
                "Maintain current service levels",
                "Monitor for emerging patterns",
                "Continue proactive customer communication",
            ]

        return recommendations

    def _analyze_trend_patterns(self, trend_data) -> Dict[str, Any]:
        """Analyze patterns in trend data"""
        if not trend_data or len(trend_data) < 7:
            return {"pattern": "insufficient_data", "confidence": 0.0}

        # Simple trend analysis
        recent_avg = sum(row.daily_count for row in trend_data[:7]) / 7
        older_avg = sum(row.daily_count for row in trend_data[7:14]) / min(
            7, len(trend_data) - 7
        )

        if recent_avg > older_avg * 1.2:
            pattern = "increasing"
        elif recent_avg < older_avg * 0.8:
            pattern = "decreasing"
        else:
            pattern = "stable"

        return {
            "pattern": pattern,
            "recent_avg": recent_avg,
            "change_percentage": (
                ((recent_avg - older_avg) / older_avg * 100) if older_avg > 0 else 0
            ),
            "confidence": 0.8,
        }

    def _forecast_volume(self, trend_data) -> Dict[str, Any]:
        """Simple volume forecasting"""
        if not trend_data:
            return {"forecast": "unavailable"}

        recent_avg = sum(row.daily_count for row in trend_data[:7]) / min(
            7, len(trend_data)
        )

        return {
            "next_7_days_estimate": int(recent_avg * 7),
            "daily_average": recent_avg,
            "confidence": "medium",
        }

    def _generate_strategy_recommendations(self, top_strategies) -> List[str]:
        """Generate recommendations based on successful strategies"""
        recommendations = []

        for strategy, count in top_strategies:
            if "refund" in strategy.lower():
                recommendations.append("Consider immediate refund for similar cases")
            elif "communication" in strategy.lower():
                recommendations.append("Prioritize proactive customer communication")
            elif "escalation" in strategy.lower():
                recommendations.append("Implement structured escalation process")

        if not recommendations:
            recommendations = ["Follow established resolution procedures"]

        return recommendations

    def _get_mock_similar_complaints(self) -> List[Dict[str, Any]]:
        """Mock similar complaints data"""
        return [
            {
                "id": 12345,
                "narrative": "Similar complaint about unauthorized charges",
                "similarity_score": 0.89,
                "resolution_strategy": "Full refund provided within 24 hours",
                "customer_satisfaction": 5,
                "resolution_time_hours": 18,
                "outcome": "satisfied",
            },
            {
                "id": 12346,
                "narrative": "Another similar billing dispute",
                "similarity_score": 0.82,
                "resolution_strategy": "Partial refund + fee waiver + apology letter",
                "customer_satisfaction": 4,
                "resolution_time_hours": 36,
                "outcome": "satisfied",
            },
        ]

    def _get_mock_benchmarks(self) -> Dict[str, Any]:
        """Mock benchmark data"""
        return {
            "total_similar_complaints": 156,
            "avg_resolution_time": "24.5h",
            "avg_satisfaction_score": 4.2,
            "high_risk_percentage": 12.5,
            "success_rate": 87.3,
            "confidence": 0.85,
            "recommended_actions": [
                "Immediate refund processing for verified unauthorized charges",
                "Proactive communication within 2 hours of complaint receipt",
                "Follow-up call within 24 hours of resolution",
            ],
        }

    def _get_mock_trends(self) -> Dict[str, Any]:
        """Mock trend data"""
        return {
            "daily_volume": [
                {"date": "2024-01-15", "count": 12, "avg_risk": 0.45},
                {"date": "2024-01-14", "count": 8, "avg_risk": 0.38},
                {"date": "2024-01-13", "count": 15, "avg_risk": 0.52},
            ],
            "trend_analysis": {
                "pattern": "stable",
                "recent_avg": 11.7,
                "change_percentage": 5.2,
                "confidence": 0.8,
            },
            "volume_forecast": {
                "next_7_days_estimate": 82,
                "daily_average": 11.7,
                "confidence": "medium",
            },
        }


# Global instance
stats_finder_agent = StatsFinderAgent()
