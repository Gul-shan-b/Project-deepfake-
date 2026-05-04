import React, { useEffect, useState } from 'react';
import styles from './ResultCard.module.css';

const AnimatedBar = ({ value, color }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(Math.round(value * 100)), 100);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className={styles.barTrack}>
      <div
        className={styles.barFill}
        style={{ width: `${width}%`, background: color }}
      />
      <span className={styles.barLabel}>{width}%</span>
    </div>
  );
};

const Tag = ({ children, variant = 'neutral' }) => (
  <span className={`${styles.tag} ${styles[`tag_${variant}`]}`}>{children}</span>
);

const FeatureRow = ({ label, value, format = 'percent' }) => {
  const display =
    format === 'percent'
      ? `${Math.round(value * 100)}%`
      : format === 'number'
      ? value.toFixed(1)
      : value;

  return (
    <div className={styles.featureRow}>
      <span className={styles.featureLabel}>{label}</span>
      <span className={styles.featureValue}>{display}</span>
    </div>
  );
};

const ResultCard = ({ result }) => {
  const isAI = result.prediction === 'AI';
  const predColor = isAI ? 'var(--danger)' : 'var(--accent)';
  const confColor = isAI
    ? `rgba(255,60,90,${0.4 + result.confidence * 0.6})`
    : `rgba(0,255,136,${0.4 + result.confidence * 0.6})`;

  return (
    <div className={`${styles.card} ${isAI ? styles.cardAI : styles.cardHuman}`}>
      {/* ── Header ── */}
      <div className={styles.cardHeader}>
        <div className={styles.predictionBlock}>
          <span className={styles.predictionLabel}>VERDICT</span>
          <span className={styles.predictionValue} style={{ color: predColor }}>
            {isAI ? '⚠ AI-GENERATED' : '✓ HUMAN-WRITTEN'}
          </span>
        </div>
        <div className={styles.processingTime}>
          {result.processing_time_ms.toFixed(0)} ms
        </div>
      </div>

      {/* ── Confidence bar ── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>CONFIDENCE SCORE</div>
        <AnimatedBar value={result.confidence} color={confColor} />
      </div>

      {/* ── Tags row ── */}
      <div className={styles.tagsRow}>
        {result.misinformation && (
          <Tag variant="danger">🚨 Misinformation Risk</Tag>
        )}
        {result.paraphrase_detected && (
          <Tag variant="warn">🔄 Paraphrase Detected</Tag>
        )}
        {!result.misinformation && !result.paraphrase_detected && (
          <Tag variant="success">✅ No Flags</Tag>
        )}
        {result.misinformation && (
          <Tag variant="neutral">
            Misinfo confidence: {Math.round(result.misinformation_confidence * 100)}%
          </Tag>
        )}
      </div>

      {/* ── Explanation ── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>ANALYSIS EXPLANATION</div>
        <p className={styles.explanation}>{result.explanation}</p>
      </div>

      {/* ── Highlighted words ── */}
      {result.highlighted_words?.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>KEY INFLUENCING TERMS</div>
          <div className={styles.wordsGrid}>
            {result.highlighted_words.map((word, i) => (
              <span key={i} className={styles.word}>{word}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Linguistic features ── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>LINGUISTIC FEATURES</div>
        <div className={styles.featuresGrid}>
          <FeatureRow
            label="Avg sentence length"
            value={result.linguistic_features.avg_sentence_length}
            format="number"
          />
          <FeatureRow
            label="Vocabulary diversity"
            value={result.linguistic_features.vocabulary_diversity}
          />
          <FeatureRow
            label="Formality score"
            value={result.linguistic_features.formality_score}
          />
          <FeatureRow
            label="Punctuation density"
            value={result.linguistic_features.punctuation_density}
          />
          <FeatureRow
            label="Perplexity score"
            value={result.linguistic_features.perplexity_score}
          />
          {result.paraphrase_detected && (
            <FeatureRow
              label="Paraphrase similarity"
              value={result.paraphrase_similarity}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
