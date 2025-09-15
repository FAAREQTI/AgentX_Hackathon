"""
Enterprise-grade FastAPI application for Complaint Intelligence Platform
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from app.core.config import settings
from app.core.database import init_db
from app.core.telemetry import setup_telemetry
from app.routers import auth, complaints, stats, risk, solutions, feedback, admin
from app.middleware.tenant import TenantMiddleware
from app.middleware.auth import AuthMiddleware


# Setup logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting Complaint Intelligence API...")
    await init_db()
    setup_telemetry()
    logger.info("Application startup complete")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Complaint Intelligence API...")


# Create FastAPI application
app = FastAPI(
    title="Complaint Compass API",
    description="Enterprise-grade multi-tenant complaint analysis platform",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None,
    lifespan=lifespan
)

# Security middleware
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom middleware
app.add_middleware(TenantMiddleware)
app.add_middleware(AuthMiddleware)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(complaints.router, prefix="/api/v1/complaints", tags=["Complaints"])
app.include_router(stats.router, prefix="/api/v1/stats", tags=["Statistics"])
app.include_router(risk.router, prefix="/api/v1/risk", tags=["Risk Assessment"])
app.include_router(solutions.router, prefix="/api/v1/solutions", tags=["Solutions"])
app.include_router(feedback.router, prefix="/api/v1/feedback", tags=["Feedback"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Administration"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Complaint Compass API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "database": "connected"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development",
        log_level=settings.LOG_LEVEL.lower()
    )