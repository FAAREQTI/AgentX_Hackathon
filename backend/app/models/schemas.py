from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum
from langchain_core.messages import BaseMessage


class UserRole(str, Enum):
    CONSUMER = "consumer"
    ANALYST = "analyst"
    ADMIN = "admin"
    REGULATOR = "regulator"


class RiskCategory(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


# LangGraph State Schema
class ComplaintState(BaseModel):
    complaint_id: int
    tenant_id: str
    user_id: str
    narrative: str

    # Agent outputs
    entities: Dict[str, Any] = {}
    sentiment: Dict[str, Any] = {}
    classification: Dict[str, str] = {}
    similar_complaints: List[Dict[str, Any]] = []
    benchmarks: Dict[str, Any] = {}
    risk_assessment: Dict[str, Any] = {}
    solution: Dict[str, Any] = {}
    feedback_analysis: Dict[str, Any] = {}

    # Additional processing data
    redacted_narrative: str = ""
    pii_detected: bool = False
    metadata: Dict[str, Any] = {}

    # Workflow metadata
    messages: List[BaseMessage] = []
    current_agent: str = ""
    processing_steps: List[Dict[str, Any]] = []
    errors: List[str] = []


# Auth schemas
class UserCreate(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="User password")
    first_name: str = Field(..., description="User first name")
    last_name: str = Field(..., description="User last name")
    tenant_id: str = Field(..., description="Tenant ID")
    role: UserRole = Field(UserRole.CONSUMER, description="User role")


class UserLogin(BaseModel):
    email: str
    password: str
    tenant_id: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: str
    tenant_id: str
    role: UserRole


class User(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    tenant_id: str
    role: UserRole
    is_active: bool
    created_at: datetime


# Complaint schemas
class ComplaintCreate(BaseModel):
    narrative: str = Field(..., description="Complaint narrative text")
    product: Optional[str] = Field(None, description="Product category")
    issue: Optional[str] = Field(None, description="Issue category")
    company: Optional[str] = Field(None, description="Company name")


class ComplaintResponse(BaseModel):
    id: int
    tenant_id: str
    user_id: str
    narrative: str
    product: Optional[str]
    issue: Optional[str]
    company: Optional[str]
    created_at: datetime
    risk_score: Optional[float] = None
    risk_category: Optional[RiskCategory] = None


class ComplaintAnalysis(BaseModel):
    complaint_id: int
    entities: Dict[str, Any]
    classification: Dict[str, str]
    risk_assessment: Dict[str, Any]
    similar_complaints: List[Dict[str, Any]]
    benchmarks: Dict[str, Any]


# Risk schemas
class RiskAssessment(BaseModel):
    complaint_id: int
    risk_score: float = Field(..., ge=0, le=1, description="Risk score between 0 and 1")
    risk_category: RiskCategory
    factors: Dict[str, Any]
    model_version: str
    confidence: float


# Solution schemas
class SolutionCreate(BaseModel):
    complaint_id: int
    solution_text: str
    resolution_strategy: str


class SolutionResponse(BaseModel):
    id: int
    complaint_id: int
    tenant_id: str
    solution_text: str
    resolution_strategy: str
    created_at: datetime


# Stats schemas
class StatsQuery(BaseModel):
    tenant_id: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    product: Optional[str] = None
    issue: Optional[str] = None


class ComplaintStats(BaseModel):
    total_complaints: int
    avg_resolution_time: float
    satisfaction_rate: float
    high_risk_percentage: float
    top_issues: List[Dict[str, Any]]
    trends: Dict[str, Any]


class BenchmarkData(BaseModel):
    tenant_performance: Dict[str, Any]
    industry_average: Dict[str, Any]
    peer_comparison: List[Dict[str, Any]]


# Feedback schemas
class FeedbackCreate(BaseModel):
    complaint_id: int
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")
    comment: Optional[str] = None


class FeedbackResponse(BaseModel):
    id: int
    complaint_id: int
    tenant_id: str
    rating: int
    comment: Optional[str]
    created_at: datetime


# Admin schemas
class TenantCreate(BaseModel):
    name: str
    domain: str
    settings: Optional[Dict[str, Any]] = None


class TenantResponse(BaseModel):
    id: str
    name: str
    domain: str
    is_active: bool
    settings: Dict[str, Any]
    created_at: datetime


class AuditLog(BaseModel):
    id: int
    tenant_id: str
    user_id: str
    action: str
    payload: Dict[str, Any]
    created_at: datetime


# Agent workflow schemas
class AgentStep(BaseModel):
    agent_name: str
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]
    execution_time: float
    status: str


class WorkflowResult(BaseModel):
    complaint_id: int
    steps: List[AgentStep]
    total_execution_time: float
    final_result: Dict[str, Any]
