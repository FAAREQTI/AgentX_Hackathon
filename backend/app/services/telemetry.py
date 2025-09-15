"""
Telemetry and observability service
"""
import logging
import time
from functools import wraps
from typing import Any, Callable
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor

from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize tracer
tracer = trace.get_tracer(__name__)


def setup_telemetry():
    """Setup OpenTelemetry tracing"""
    try:
        # Set up tracer provider
        trace.set_tracer_provider(TracerProvider())
        
        # Configure Jaeger exporter
        jaeger_exporter = JaegerExporter(
            agent_host_name="localhost",
            agent_port=6831,
        )
        
        # Add span processor
        span_processor = BatchSpanProcessor(jaeger_exporter)
        trace.get_tracer_provider().add_span_processor(span_processor)
        
        # Instrument SQLAlchemy
        SQLAlchemyInstrumentor().instrument()
        
        logger.info("Telemetry setup complete")
        
    except Exception as e:
        logger.warning(f"Failed to setup telemetry: {e}")


def trace_endpoint(func: Callable) -> Callable:
    """Decorator to trace endpoint execution"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        with tracer.start_as_current_span(f"{func.__module__}.{func.__name__}") as span:
            start_time = time.time()
            try:
                result = await func(*args, **kwargs)
                span.set_attribute("success", True)
                return result
            except Exception as e:
                span.set_attribute("success", False)
                span.set_attribute("error", str(e))
                raise
            finally:
                execution_time = time.time() - start_time
                span.set_attribute("execution_time", execution_time)
    
    return wrapper


def trace_function(operation_name: str = None):
    """Decorator to trace function execution"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            span_name = operation_name or f"{func.__module__}.{func.__name__}"
            with tracer.start_as_current_span(span_name) as span:
                start_time = time.time()
                try:
                    result = await func(*args, **kwargs)
                    span.set_attribute("success", True)
                    return result
                except Exception as e:
                    span.set_attribute("success", False)
                    span.set_attribute("error", str(e))
                    raise
                finally:
                    execution_time = time.time() - start_time
                    span.set_attribute("execution_time", execution_time)
        
        return wrapper
    return decorator