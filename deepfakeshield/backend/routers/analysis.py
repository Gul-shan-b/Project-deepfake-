"""
DeepFakeShield - Analysis Router
POST /analyze-text endpoint.
"""

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse

from models.schemas import TextAnalysisRequest, TextAnalysisResponse, ErrorResponse
from services.analysis_service import TextAnalysisService

router = APIRouter()


def _get_service() -> TextAnalysisService:
    return TextAnalysisService()


@router.post(
    "/analyze-text",
    response_model=TextAnalysisResponse,
    responses={422: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Analyze text for AI origin and misinformation",
)
async def analyze_text(payload: TextAnalysisRequest):
    """
    Accepts raw text and returns:
    - **prediction**: AI or Human
    - **confidence**: float 0-1
    - **misinformation**: bool
    - **explanation**: natural-language reasoning
    - **highlighted_words**: key influencing terms
    - **linguistic_features**: detailed feature breakdown
    - **paraphrase_detected**: whether AI content was paraphrased
    """
    try:
        svc = _get_service()
        result = svc.analyze(payload.text)
        return result
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}")


@router.get("/analyze-text/example", summary="Return example test inputs")
async def get_examples():
    return {
        "examples": [
            {
                "label": "Likely AI-generated",
                "text": (
                    "Furthermore, it is important to note that the utilization of "
                    "artificial intelligence has fundamentally transformed modern workflows. "
                    "In conclusion, leveraging cutting-edge machine learning algorithms "
                    "enables unprecedented capabilities and plays a pivotal role in shaping "
                    "the future of various industries."
                ),
            },
            {
                "label": "Likely Human-written",
                "text": (
                    "I'm honestly not sure what to make of this whole AI thing. "
                    "Like, sure, it's cool, but it also freaks me out a little? "
                    "My friend showed me this chatbot last week and I couldn't tell "
                    "if it was joking or serious half the time."
                ),
            },
            {
                "label": "Misinformation signals",
                "text": (
                    "Scientists confirm that 5G towers are secretly spreading a new virus. "
                    "This is a proven fact that mainstream media doesn't want you to know. "
                    "The government is covering up this shocking truth. Wake up, sheeple!"
                ),
            },
        ]
    }
