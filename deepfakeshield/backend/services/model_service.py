"""
DeepFakeShield - Model Service
Singleton service that loads and manages all ML models.
"""

from __future__ import annotations
import logging
import threading
from typing import Optional

logger = logging.getLogger(__name__)


class ModelService:
    """
    Singleton that lazily loads NLP/ML models on first use.
    Thread-safe initialization via a lock.
    """

    _instance: Optional[ModelService] = None
    _lock = threading.Lock()

    # ── model handles ──────────────────────────────────────────────────────────
    roberta_tokenizer = None
    roberta_model = None
    sentence_model = None
    nlp = None               # spaCy pipeline
    _initialized = False

    # ── known AI "fingerprint" embeddings (populated at init) ──────────────────
    ai_fingerprint_embeddings = None

    @classmethod
    def get_instance(cls) -> ModelService:
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    # ──────────────────────────────────────────────────────────────────────────

    def initialize(self) -> None:
        """Load every model exactly once."""
        if self._initialized:
            return

        with self._lock:
            if self._initialized:
                return
            self._load_models()
            self._initialized = True

    # ──────────────────────────────────────────────────────────────────────────

    def _load_models(self) -> None:
        logger.info("Loading RoBERTa tokenizer & model …")
        try:
            from transformers import RobertaTokenizer, RobertaForSequenceClassification
            import torch

            model_name = "roberta-base-openai-detector"
            self.roberta_tokenizer = RobertaTokenizer.from_pretrained(model_name)
            self.roberta_model = RobertaForSequenceClassification.from_pretrained(model_name)
            self.roberta_model.eval()
            logger.info("  ✓ RoBERTa loaded")
        except Exception as exc:
            logger.warning("RoBERTa load failed (%s) – will use heuristic fallback", exc)

        logger.info("Loading Sentence-Transformers …")
        try:
            from sentence_transformers import SentenceTransformer
            import numpy as np

            self.sentence_model = SentenceTransformer("all-MiniLM-L6-v2")

            # Build a tiny set of AI-text fingerprint embeddings for paraphrase detection
            seed_texts = [
                "The utilization of artificial intelligence has fundamentally transformed modern workflows.",
                "In conclusion, it is evident that the aforementioned factors contribute significantly.",
                "Furthermore, it is important to note that various stakeholders must consider the implications.",
                "The implementation of advanced machine learning algorithms enables unprecedented capabilities.",
                "Recent developments in natural language processing have demonstrated remarkable progress.",
            ]
            self.ai_fingerprint_embeddings = self.sentence_model.encode(
                seed_texts, convert_to_numpy=True, normalize_embeddings=True
            )
            logger.info("  ✓ Sentence-Transformers loaded")
        except Exception as exc:
            logger.warning("Sentence-Transformers load failed (%s)", exc)

        logger.info("Loading spaCy …")
        try:
            import spacy
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except OSError:
                from spacy.cli import download as spacy_download
                spacy_download("en_core_web_sm")
                self.nlp = spacy.load("en_core_web_sm")
            logger.info("  ✓ spaCy loaded")
        except Exception as exc:
            logger.warning("spaCy load failed (%s)", exc)
