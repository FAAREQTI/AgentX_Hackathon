import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Extract auth information
        auth_header = request.headers.get("Authorization")

        # Store auth context in request state
        request.state.auth_header = auth_header

        response = await call_next(request)
        return response
