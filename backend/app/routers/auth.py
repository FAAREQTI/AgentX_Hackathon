"""
Authentication and authorization endpoints
"""
import logging
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.context import CryptContext
from jose import JWTError, jwt
import uuid

from app.core.database import get_db
from app.core.config import settings
from app.models.database import User, Tenant
from app.models.schemas import UserCreate, UserLogin, Token, User as UserSchema
from app.services.telemetry import trace_endpoint

logger = logging.getLogger(__name__)
router = APIRouter()

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/token")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash password"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


async def get_user_by_email(db: AsyncSession, email: str, tenant_id: str) -> Optional[User]:
    """Get user by email and tenant"""
    query = select(User).where(
        User.email == email,
        User.tenant_id == tenant_id,
        User.is_active == True
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def authenticate_user(db: AsyncSession, email: str, password: str, tenant_id: str) -> Optional[User]:
    """Authenticate user"""
    user = await get_user_by_email(db, email, tenant_id)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        tenant_id: str = payload.get("tenant_id")
        if user_id is None or tenant_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    query = select(User).where(
        User.id == user_id,
        User.tenant_id == tenant_id,
        User.is_active == True
    )
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
    return user


@router.post("/register", response_model=UserSchema)
@trace_endpoint
async def register_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Register new user"""
    try:
        # Check if user already exists
        existing_user = await get_user_by_email(db, user_data.email, user_data.tenant_id)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Verify tenant exists
        tenant_query = select(Tenant).where(
            Tenant.id == user_data.tenant_id,
            Tenant.is_active == True
        )
        tenant_result = await db.execute(tenant_query)
        tenant = tenant_result.scalar_one_or_none()
        
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid tenant"
            )
        
        # Create user
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            id=str(uuid.uuid4()),
            email=user_data.email,
            hashed_password=hashed_password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            tenant_id=user_data.tenant_id,
            role=user_data.role.value
        )
        
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        
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
        logger.error(f"Error registering user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user"
        )


@router.post("/token", response_model=Token)
@trace_endpoint
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """Login and get access token"""
    try:
        # Extract tenant_id from username (format: email@tenant_id)
        if "@" not in form_data.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid username format"
            )
        
        email_parts = form_data.username.split("@")
        if len(email_parts) != 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid username format"
            )
        
        email = email_parts[0] + "@" + email_parts[1].split("_")[0]  # Extract actual email
        tenant_id = email_parts[1].split("_")[-1] if "_" in email_parts[1] else "default"
        
        user = await authenticate_user(db, email, form_data.password, tenant_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.id, "tenant_id": user.tenant_id, "role": user.role},
            expires_delta=access_token_expires
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user_id=user.id,
            tenant_id=user.tenant_id,
            role=user.role
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.post("/login", response_model=Token)
@trace_endpoint
async def login_user(
    login_data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """Login user with email/password/tenant"""
    try:
        user = await authenticate_user(db, login_data.email, login_data.password, login_data.tenant_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect credentials"
            )
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.id, "tenant_id": user.tenant_id, "role": user.role},
            expires_delta=access_token_expires
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user_id=user.id,
            tenant_id=user.tenant_id,
            role=user.role
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.get("/me", response_model=UserSchema)
@trace_endpoint
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserSchema(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        tenant_id=current_user.tenant_id,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )