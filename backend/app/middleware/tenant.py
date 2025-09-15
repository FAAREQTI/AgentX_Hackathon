import logging
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Extract tenant information from headers or path
        tenant_id = request.headers.get("X-Tenant-ID")

        # Store tenant context in request state
        request.state.tenant_id = tenant_id

        response = await call_next(request)
        return response
