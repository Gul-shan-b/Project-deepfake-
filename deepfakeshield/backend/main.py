"""
DeepFakeShield - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from routers import analysis
from services.model_service import ModelService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup, clean up on shutdown."""
    logger.info("🚀 DeepFakeShield backend starting up...")
    model_service = ModelService.get_instance()
    model_service.initialize()
    logger.info("✅ Models loaded successfully")
    yield
    logger.info("🛑 DeepFakeShield backend shutting down...")


app = FastAPI(
    title="DeepFakeShield API",
    description="AI-powered deepfake & misinformation detection platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(analysis.router, prefix="/api/v1", tags=["Analysis"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "DeepFakeShield API v1.0.0"}
