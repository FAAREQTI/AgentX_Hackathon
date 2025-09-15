from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    DateTime,
    Boolean,
    JSON,
    ForeignKey,
    Index,
)
from sqlalchemy.dialects.mysql import BIGINT, VARCHAR
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(VARCHAR(36), primary_key=True)
    email = Column(VARCHAR(255), unique=True, nullable=False, index=True)
    hashed_password = Column(VARCHAR(255), nullable=False)
    first_name = Column(VARCHAR(100), nullable=False)
    last_name = Column(VARCHAR(100), nullable=False)
    tenant_id = Column(VARCHAR(36), nullable=False, index=True)
    role = Column(VARCHAR(50), nullable=False, default="consumer")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(VARCHAR(36), primary_key=True)
    name = Column(VARCHAR(255), nullable=False)
    domain = Column(VARCHAR(255), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    settings = Column(JSON, default={})
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class ComplaintRaw(Base):
    __tablename__ = "complaints_raw"

    id = Column(BIGINT, primary_key=True, autoincrement=True)
    tenant_id = Column(VARCHAR(36), nullable=False, index=True)
    user_id = Column(VARCHAR(36), nullable=True, index=True)
    narrative = Column(Text, nullable=False)
    product = Column(VARCHAR(255), nullable=True)
    issue = Column(VARCHAR(255), nullable=True)
    company = Column(VARCHAR(255), nullable=True)
    embedding = Column(
        Text, nullable=True
    )  # VECTOR(1536) - stored as JSON string for now
    created_at = Column(DateTime, default=func.now())

    # Relationships
    labels = relationship("ComplaintLabel", back_populates="complaint")
    risk_scores = relationship("RiskScore", back_populates="complaint")
    solutions = relationship("Solution", back_populates="complaint")
    feedback = relationship("Feedback", back_populates="complaint")


class ComplaintLabel(Base):
    __tablename__ = "complaints_labels"

    id = Column(BIGINT, primary_key=True, autoincrement=True)
    complaint_id = Column(BIGINT, ForeignKey("complaints_raw.id"), nullable=False)
    tenant_id = Column(VARCHAR(36), nullable=False, index=True)
    product = Column(VARCHAR(255), nullable=True)
    issue = Column(VARCHAR(255), nullable=True)
    company = Column(VARCHAR(255), nullable=True)
    confidence = Column(Float, nullable=True)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    complaint = relationship("ComplaintRaw", back_populates="labels")


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(BIGINT, primary_key=True, autoincrement=True)
    complaint_id = Column(BIGINT, ForeignKey("complaints_raw.id"), nullable=False)
    tenant_id = Column(VARCHAR(36), nullable=False, index=True)
    risk = Column(Float, nullable=False)
    category = Column(VARCHAR(50), nullable=False)
    factors = Column(JSON, default={})
    model_version = Column(VARCHAR(50), nullable=False)
    confidence = Column(Float, nullable=True)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    complaint = relationship("ComplaintRaw", back_populates="risk_scores")


class Solution(Base):
    __tablename__ = "solutions"

    id = Column(BIGINT, primary_key=True, autoincrement=True)
    complaint_id = Column(BIGINT, ForeignKey("complaints_raw.id"), nullable=False)
    tenant_id = Column(VARCHAR(36), nullable=False, index=True)
    solution_text = Column(Text, nullable=False)
    resolution_strategy = Column(VARCHAR(255), nullable=True)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    complaint = relationship("ComplaintRaw", back_populates="solutions")


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(BIGINT, primary_key=True, autoincrement=True)
    complaint_id = Column(BIGINT, ForeignKey("complaints_raw.id"), nullable=False)
    tenant_id = Column(VARCHAR(36), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    complaint = relationship("ComplaintRaw", back_populates="feedback")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(BIGINT, primary_key=True, autoincrement=True)
    tenant_id = Column(VARCHAR(36), nullable=False, index=True)
    user_id = Column(VARCHAR(36), nullable=True, index=True)
    action = Column(VARCHAR(255), nullable=False)
    payload = Column(JSON, default={})
    created_at = Column(DateTime, default=func.now())


# Indexes for performance
Index("idx_complaints_tenant_created", ComplaintRaw.tenant_id, ComplaintRaw.created_at)
Index("idx_complaints_product_issue", ComplaintRaw.product, ComplaintRaw.issue)
Index("idx_risk_scores_tenant_risk", RiskScore.tenant_id, RiskScore.risk)
Index("idx_feedback_tenant_rating", Feedback.tenant_id, Feedback.rating)
