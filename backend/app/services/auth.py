"""
Authentication service
"""
from app.routers.auth import get_current_user

# Re-export for convenience
__all__ = ["get_current_user"]