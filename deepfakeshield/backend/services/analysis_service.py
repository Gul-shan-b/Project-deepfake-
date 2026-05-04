"""
DeepFakeShield - Text Analysis Service
Core detection logic: AI/Human classification, misinformation, paraphrase, explainability.
"""

from __future__ import annotations
import re
import math
import time
import logging
from typing import List, Tuple

from services.model_service import ModelService
from models.schemas import TextAnalysisResponse, LinguisticFeatures

logger = logging.getLogger(__name__)

# ── Misinformation keyword signals ────────────────────────────────────────────
MISINFO_SIGNALS: List[str] = [
    "scientists confirm", "experts say", "studies show", "proven fact",
    "100%", "guaranteed", "miracle cure", "secret", "they don't want you",
    "mainstream media", "deep state", "fake news", "hoax", "conspiracy",
    "cover-up", "suppressed", "banned", "censored", "government hiding",
    "shocking truth", "wake up", "sheeple", "agenda", "plandemic",
    "5g causes", "microchip", "flat earth", "crisis actor",
]

# ── AI writing style markers ──────────────────────────────────────────────────
AI_STYLE_MARKERS: List[str] = [
    "furthermore", "moreover", "additionally", "in conclusion",
    "it is important to note", "it is worth mentioning",
    "in today's world", "in the realm of", "delve into",
    "leverage", "utilize", "facilitate", "it is evident",
    "play a crucial role", "a pivotal role", "at its core",
    "in summary", "to summarize", "overall", "ultimately",
    "shed light on", "underscore", "paramount", "multifaceted",
    "myriad", "tapestry", "groundbreaking", "transformative",
    "game-changer", "cutting-edge", "state-of-the-art",
]

# ── Human writing signals ─────────────────────────────────────────────────────
CONTRACTIONS: List[str] = [
    "i'm", "it's", "don't", "can't", "won't", "i've", "they're", "we're",
    "isn't", "wasn't", "didn't", "couldn't", "wouldn't", "i'll", "that's",
    "he's", "she's", "you're", "let's", "there's", "what's", "i'd", "you'd",
    "we'd", "they'd", "hasn't", "haven't", "hadn't", "doesn't", "aren't",
]

INFORMAL_WORDS: List[str] = [
    "like", "honestly", "basically", "literally", "actually", "anyway",
    "stuff", "thing", "kinda", "sorta", "yeah", "nope", "wow", "omg",
    "lol", "haha", "tbh", "imo", "ngl", "idk", "freaks", "cool", "weird",
    "crazy", "awesome", "terrible", "pretty", "really", "just", "so",
    "totally", "super", "guy", "guys", "ok", "okay", "yep", "nah",
]


class TextAnalysisService:

    def __init__(self):
        self.svc = ModelService.get_instance()

    # ── Public API ─────────────────────────────────────────────────────────────

    def analyze(self, text: str) -> TextAnalysisResponse:
        t0 = time.perf_counter()

        # Always use heuristic - fast and reliable
        # RoBERTa is too slow on CPU for real-time use
        prediction, confidence, highlighted = self._classify_ai_vs_human(text)
        misinfo, misinfo_conf = self._detect_misinformation(text)
        paraphrase, para_sim = self._detect_paraphrase(text)
        ling = self._extract_linguistic_features(text)
        explanation = self._build_explanation(
            text, prediction, confidence, misinfo, paraphrase, ling
        )

        elapsed = (time.perf_counter() - t0) * 1000

        return TextAnalysisResponse(
            prediction=prediction,
            confidence=round(confidence, 4),
            misinformation=misinfo,
            misinformation_confidence=round(misinfo_conf, 4),
            explanation=explanation,
            highlighted_words=highlighted,
            linguistic_features=ling,
            paraphrase_detected=paraphrase,
            paraphrase_similarity=round(para_sim, 4),
            processing_time_ms=round(elapsed, 2),
        )

    # ── Classification ─────────────────────────────────────────────────────────

    def _classify_ai_vs_human(self, text: str) -> Tuple[str, float, List[str]]:
        """
        Fast heuristic classifier - works instantly without GPU.
        Uses linguistic patterns, style markers, and writing signals.
        """
        return self._heuristic_classify(text)

    def _heuristic_classify(self, text: str) -> Tuple[str, float, List[str]]:
        lower = text.lower()
        words = text.split()

        # ── AI signals ──
        marker_hits = [m for m in AI_STYLE_MARKERS if m in lower]
        marker_score = min(len(marker_hits) / 3, 1.0)

        unique_ratio = len(set(w.lower() for w in words)) / max(len(words), 1)
        # Low diversity = AI signal
        diversity_score = max(0.0, 1.0 - unique_ratio * 1.1)

        sentences = [s.strip() for s in re.split(r'[.!?]+', text) if len(s.strip()) > 5]
        avg_sent_len = sum(len(s.split()) for s in sentences) / max(len(sentences), 1)
        # Very long uniform sentences = AI signal
        long_sent_score = min(max(avg_sent_len - 15, 0) / 20, 1.0)

        # ── Human signals ──
        contraction_hits = sum(1 for c in CONTRACTIONS if c in lower)
        informal_hits = sum(1 for w in INFORMAL_WORDS if re.search(r'\b' + w + r'\b', lower))
        question_exclaim = text.count('?') + text.count('!')

        # First person casual usage
        first_person = len(re.findall(r'\b(i|me|my|myself|i\'m|i\'ve|i\'ll|i\'d)\b', lower))

        # Score human signals
        contraction_score = min(contraction_hits / 2, 1.0)
        informal_score = min(informal_hits / 3, 1.0)
        punct_score = min(question_exclaim / 2, 1.0)
        first_person_score = min(first_person / 3, 1.0)

        human_score = (
            0.35 * contraction_score +
            0.25 * informal_score +
            0.20 * punct_score +
            0.20 * first_person_score
        )

        ai_score = (
            0.50 * marker_score +
            0.30 * diversity_score +
            0.20 * long_sent_score
        )

        # ── Decision logic ──

        # Strong human indicators override everything
        if contraction_hits >= 2 or (contraction_hits >= 1 and informal_hits >= 2):
            conf = 0.62 + min(human_score * 0.30, 0.30)
            return "Human", round(conf, 4), marker_hits[:3]

        # Strong AI indicators
        if marker_score >= 0.33 and diversity_score >= 0.2:
            conf = 0.65 + min(ai_score * 0.30, 0.30)
            return "AI", round(conf, 4), marker_hits[:8]

        # Moderate human signals
        if human_score > ai_score and human_score > 0.15:
            conf = 0.57 + min(human_score * 0.25, 0.25)
            return "Human", round(conf, 4), marker_hits[:3]

        # Moderate AI signals
        if ai_score > human_score and ai_score > 0.15:
            conf = 0.60 + min(ai_score * 0.25, 0.25)
            return "AI", round(conf, 4), marker_hits[:6]

        # Default: lean human for short/ambiguous text
        return "Human", 0.56, []

    # ── Misinformation ─────────────────────────────────────────────────────────

    def _detect_misinformation(self, text: str) -> Tuple[bool, float]:
        lower = text.lower()
        hits = [s for s in MISINFO_SIGNALS if s in lower]

        extreme_patterns = [
            r'\b(always|never|all|none|every|no one)\b',
            r'\b\d{1,3}%\s*(of\s+)?((all|every)\s+)?(people|scientists|doctors|experts)\b',
            r'\bproven\b.*\bscientists\b|\bscientists\b.*\bproven\b',
        ]
        pattern_hits = sum(1 for p in extreme_patterns if re.search(p, lower))

        raw_score = len(hits) * 0.15 + pattern_hits * 0.20
        confidence = min(raw_score, 1.0)
        detected = confidence >= 0.20
        return detected, confidence

    # ── Paraphrase detection ───────────────────────────────────────────────────

    def _detect_paraphrase(self, text: str) -> Tuple[bool, float]:
        """
        Skip sentence transformer on CPU - use fast keyword-based paraphrase detection.
        """
        lower = text.lower()

        # Check for AI marker density even without exact phrases
        ai_word_hits = sum(1 for m in AI_STYLE_MARKERS if any(w in lower for w in m.split()))
        total_words = max(len(text.split()), 1)
        density = ai_word_hits / total_words

        # If high AI word density but no exact marker matches = possibly paraphrased
        exact_hits = sum(1 for m in AI_STYLE_MARKERS if m in lower)
        if density > 0.15 and exact_hits == 0:
            sim = min(density * 2, 0.85)
            return True, round(sim, 4)

        return False, round(min(density, 0.7), 4)

    # ── Linguistic features ────────────────────────────────────────────────────

    def _extract_linguistic_features(self, text: str) -> LinguisticFeatures:
        words = re.findall(r'\b\w+\b', text)
        sentences = [s.strip() for s in re.split(r'[.!?]+', text) if len(s.strip()) > 5]

        avg_sent_len = (
            sum(len(s.split()) for s in sentences) / len(sentences)
            if sentences else 0.0
        )

        unique_ratio = (
            len(set(w.lower() for w in words)) / len(words) if words else 0.0
        )

        punct_chars = sum(1 for c in text if c in '.,;:!?-–—()"\'')
        punct_density = punct_chars / max(len(text), 1)

        long_words = sum(1 for w in words if len(w) >= 7)
        formality_score = min(long_words / max(len(words), 1) * 3, 1.0)

        from collections import Counter
        freq = Counter(w.lower() for w in words)
        total = sum(freq.values())
        entropy = -sum((c / total) * math.log2(c / total) for c in freq.values() if c > 0)
        perplexity_score = min(entropy / 10.0, 1.0)

        return LinguisticFeatures(
            avg_sentence_length=round(avg_sent_len, 2),
            vocabulary_diversity=round(unique_ratio, 4),
            punctuation_density=round(punct_density, 4),
            formality_score=round(formality_score, 4),
            perplexity_score=round(perplexity_score, 4),
        )

    # ── Explanation builder ────────────────────────────────────────────────────

    def _build_explanation(
        self,
        text: str,
        prediction: str,
        confidence: float,
        misinfo: bool,
        paraphrase: bool,
        ling: LinguisticFeatures,
    ) -> str:
        parts: List[str] = []
        pct = int(confidence * 100)
        lower = text.lower()

        if prediction == "AI":
            parts.append(
                f"The text is classified as AI-generated with {pct}% confidence. "
                f"Key signals include a formal tone (formality score: {ling.formality_score:.0%}), "
                f"low vocabulary diversity ({ling.vocabulary_diversity:.0%}), and "
                f"structured sentence patterns averaging {ling.avg_sentence_length:.1f} words per sentence."
            )
            found_markers = [m for m in AI_STYLE_MARKERS if m in lower]
            if found_markers:
                sample = ", ".join(f'"{m}"' for m in found_markers[:4])
                parts.append(f"AI-style phrases detected: {sample}.")
        else:
            contraction_hits = sum(1 for c in CONTRACTIONS if c in lower)
            informal_hits = sum(1 for w in INFORMAL_WORDS if re.search(r'\b' + w + r'\b', lower))
            parts.append(
                f"The text is classified as Human-written with {pct}% confidence. "
                f"It shows natural vocabulary diversity ({ling.vocabulary_diversity:.0%}), "
                f"varied sentence lengths, and organic phrasing patterns."
            )
            if contraction_hits > 0:
                parts.append(f"Detected {contraction_hits} contraction(s) — a strong human writing signal.")
            if informal_hits > 0:
                parts.append(f"Detected {informal_hits} informal/colloquial word(s) typical of human writing.")

        if paraphrase:
            parts.append(
                "⚠️ Paraphrase Alert: High density of AI-associated vocabulary detected — "
                "this text may be a paraphrased version of AI-generated content."
            )

        if misinfo:
            parts.append(
                "🚨 Misinformation Risk: The text contains language patterns associated with "
                "unverified claims — absolute certainty statements, conspiracy-adjacent keywords, "
                "or unattributed expert claims. Verify with authoritative sources."
            )
        else:
            parts.append("✅ No significant misinformation signals detected.")

        return " ".join(parts)