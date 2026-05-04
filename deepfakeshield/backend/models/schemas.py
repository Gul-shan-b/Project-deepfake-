"""
DeepFakeShield - Data Schemas
Request and response models for the API
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class TextAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=10000, description="Text to analyze")

    class Config:
        json_schema_extra = {
            "example": {
                "text": "Artificial intelligence has revolutionized the way we process information, enabling machines to perform tasks that once required human intelligence."
            }
        }


class LinguisticFeatures(BaseModel):
    avg_sentence_length: float
    vocabulary_diversity: float
    punctuation_density: float
    formality_score: float
    perplexity_score: float


class TextAnalysisResponse(BaseModel):
    prediction: str = Field(..., description="'AI' or 'Human'")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score 0-1")
    misinformation: bool = Field(..., description="Whether misinformation is detected")
    misinformation_confidence: float = Field(..., ge=0.0, le=1.0)
    explanation: str = Field(..., description="Human-readable explanation")
    highlighted_words: List[str] = Field(..., description="Key terms influencing prediction")
    linguistic_features: LinguisticFeatures
    paraphrase_detected: bool = Field(..., description="Whether paraphrased AI content detected")
    paraphrase_similarity: float = Field(..., ge=0.0, le=1.0)
    processing_time_ms: float


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
