"""
Admin and tenant management endpoints
"""
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
import uuid

from app.core.database import get_db
from app.models.database import User, Tenant, AuditLog
from app.models.schemas import TenantCreate, TenantResponse, AuditLog as AuditLogSchema, UserCreate, User as UserSchema
from app.services.auth import get_current_user
from app.services.telemetry import trace_endpoint
from app.routers.auth import get_password_hash

logger = logging.getLogger(__name__)
router = APIRouter()


def require_admin_role(current_user: User = Depends(get_current_user)):
    """Dependency to require admin role"""
    if current_user.role not in ["admin", "regulator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


@router.post("/tenants", response_model=TenantResponse)
@trace_endpoint
async def create_tenant(
    tenant: TenantCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_role)
):
    """Create a new tenant (super admin only)"""
    try:
        # Check if tenant domain already exists
        existing_query = select(Tenant).where(Tenant.domain == tenant.domain)
        existing_result = await db.execute(existing_query)
        existing_tenant = existing_result.scalar_one_or_none()
        
        if existing_tenant:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tenant domain already exists"
            )
        
        # Create tenant
        db_tenant = Tenant(
            id=str(uuid.uuid4()),
            name=tenant.name,
            domain=tenant.domain,
            settings=tenant.settings or {}
        )
        
        db.add(db_tenant)
        await db.commit()
        await db.refresh(db_tenant)
        
        # Log action
        audit_log = AuditLog(
            tenant_id=current_user.tenant_id,
            user_id=current_user.id,
            action="tenant_created",
            payload={"tenant_id": db_tenant.id, "tenant_name": tenant.name}
        )
        db.add(audit_log)
        await db.commit()
        
        return TenantResponse(
            id=db_tenant.id,
            name=db_tenant.name,
            domain=db_tenant.domain,
            is_active=db_tenant.is_active,
            settings=db_tenant.settings,
            created_at=db_tenant.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating tenant: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create tenant"
        )


@router.get("/tenants", response_model=List[TenantResponse])
@trace_endpoint
async def get_tenants(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_role)
):
    """Get all tenants (admin only)"""
    try:
        query = select(Tenant).offset(skip).limit(limit).order_by(desc(Tenant.created_at))
        
        result = await db.execute(query)
        tenants = result.scalars().all()
        
        return [
            TenantResponse(
                id=t.id,
                name=t.name,
                domain=t.domain,
                is_active=t.is_active,
                settings=t.settings,
                created_at=t.created_at
            )
            for t in tenants
        ]
        
    except Exception as e:
        logger.error(f"Error getting tenants: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve tenants"
        )


@router.get("/users", response_model=List[UserSchema])
@trace_endpoint
async def get_tenant_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_role)
):
    """Get users for current tenant"""
    try:
        query = select(User).where(User.tenant_id == current_user.tenant_id)
        
        if role:
            query = query.where(User.role == role)
        
        query = query.offset(skip).limit(limit).order_by(desc(User.created_at))
        
        result = await db.execute(query)
        users = result.scalars().all()
        
        return [
            UserSchema(
                id=u.id,
                email=u.email,
                first_name=u.first_name,
                last_name=u.last_name,
                tenant_id=u.tenant_id,
                role=u.role,
                is_active=u.is_active,
                created_at=u.created_at
            )
            for u in users
        ]
        
    except Exception as e:
        logger.error(f"Error getting tenant users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve users"
        )


@router.post("/users", response_model=UserSchema)
@trace_endpoint
async def create_tenant_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_role)
):
    """Create user for current tenant"""
    try:
        # Check if user already exists
        existing_query = select(User).where(
            and_(
                User.email == user_data.email,
                User.tenant_id == current_user.tenant_id
            )
        )
        existing_result = await db.execute(existing_query)
        existing_user = existing_result.scalar_one_or_none()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already exists"
            )
        
        # Create user
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            id=str(uuid.uuid4()),
            email=user_data.email,
            hashed_password=hashed_password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            tenant_id=current_user.tenant_id,  # Use admin's tenant
            role=user_data.role.value
        )
        
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        
        # Log action
        audit_log = AuditLog(
            tenant_id=current_user.tenant_id,
            user_id=current_user.id,
            action="user_created",
            payload={"created_user_id": db_user.id, "email": user_data.email, "role": user_data.role.value}
        )
        db.add(audit_log)
        await db.commit()
        
        return UserSchema(
            id=db_user.id,
            email=db_user.email,
            first_name=db_user.first_name,
            last_name=db_user.last_name,
            tenant_id=db_user.tenant_id,
            role=db_user.role,
            is_active=db_user.is_active,
            created_at=db_user.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )


@router.get("/audit-logs", response_model=List[AuditLogSchema])
@trace_endpoint
async def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    action: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_role)
):
    """Get audit logs for tenant"""
    try:
        query = select(AuditLog).where(AuditLog.tenant_id == current_user.tenant_id)
        
        if action:
            query = query.where(AuditLog.action == action)
        
        query = query.offset(skip).limit(limit).order_by(desc(AuditLog.created_at))
        
        result = await db.execute(query)
        logs = result.scalars().all()
        
        return [
            AuditLogSchema(
                id=log.id,
                tenant_id=log.tenant_id,
                user_id=log.user_id,
                action=log.action,
                payload=log.payload,
                created_at=log.created_at
            )
            for log in logs
        ]
        
    except Exception as e:
        logger.error(f"Error getting audit logs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve audit logs"
        )


@router.put("/users/{user_id}/role")
@trace_endpoint
async def update_user_role(
    user_id: str,
    new_role: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_role)
):
    """Update user role"""
    try:
        # Get user
        user_query = select(User).where(
            and_(
                User.id == user_id,
                User.tenant_id == current_user.tenant_id
            )
        )
        user_result = await db.execute(user_query)
        user = user_result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Validate role
        valid_roles = ["consumer", "analyst", "admin"]
        if new_role not in valid_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role. Must be one of: {valid_roles}"
            )
        
        old_role = user.role
        user.role = new_role
        await db.commit()
        
        # Log action
        audit_log = AuditLog(
            tenant_id=current_user.tenant_id,
            user_id=current_user.id,
            action="user_role_updated",
            payload={"user_id": user_id, "old_role": old_role, "new_role": new_role}
        )
        db.add(audit_log)
        await db.commit()
        
        return {"message": "User role updated successfully", "user_id": user_id, "new_role": new_role}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user role: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user role"
        )


@router.delete("/users/{user_id}")
@trace_endpoint
async def deactivate_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_role)
):
    """Deactivate user (soft delete)"""
    try:
        # Get user
        user_query = select(User).where(
            and_(
                User.id == user_id,
                User.tenant_id == current_user.tenant_id
            )
        )
        user_result = await db.execute(user_query)
        user = user_result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prevent self-deactivation
        if user.id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot deactivate your own account"
            )
        
        user.is_active = False
        await db.commit()
        
        # Log action
        audit_log = AuditLog(
            tenant_id=current_user.tenant_id,
            user_id=current_user.id,
            action="user_deactivated",
            payload={"user_id": user_id, "email": user.email}
        )
        db.add(audit_log)
        await db.commit()
        
        return {"message": "User deactivated successfully", "user_id": user_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deactivating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deactivate user"
        )