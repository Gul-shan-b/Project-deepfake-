import React from 'react';
import Header from './components/Header';
import TextInput from './components/TextInput';
import ResultCard from './components/ResultCard';
import MediaPlaceholder from './components/MediaPlaceholder';
import { useAnalysis } from './hooks/useAnalysis';
import styles from './App.module.css';

function App() {
  const { loading, result, error, analyze, reset } = useAnalysis();

  return (
    <div className={styles.app}>
      <Header />

      <main className={styles.main}>
        {/* ── Hero tagline ── */}
        <div className={styles.hero}>
          <div className={styles.heroEyebrow}>
            <span className={styles.dot} /> REAL-TIME DETECTION ENGINE
          </div>
          <h2 className={styles.heroTitle}>
            Is this text<br />
            <span className={styles.heroAccent}>real or synthetic?</span>
          </h2>
          <p className={styles.heroSub}>
            Powered by RoBERTa · Sentence Transformers · Linguistic Analysis
          </p>
        </div>

        {/* ── Two-column layout ── */}
        <div className={styles.grid}>
          {/* Left: input */}
          <section className={styles.inputSection}>
            <TextInput onAnalyze={analyze} loading={loading} />

            {error && (
              <div className={styles.errorBox}>
                <span className={styles.errorIcon}>✕</span>
                <span>{error}</span>
                <button className={styles.errorDismiss} onClick={reset}>×</button>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className={styles.loadingBox}>
                <div className={styles.loadingHeader}>
                  <div className={styles.loadingBar} style={{ width: '40%' }} />
                  <div className={styles.loadingBar} style={{ width: '15%' }} />
                </div>
                <div className={styles.loadingBar} style={{ width: '100%', height: 8 }} />
                <div className={styles.loadingBar} style={{ width: '80%' }} />
                <div className={styles.loadingBar} style={{ width: '90%' }} />
                <div className={styles.loadingBar} style={{ width: '70%' }} />
                <div className={styles.loadingNote}>
                  First run may take 30-60 s while models download…
                </div>
              </div>
            )}
          </section>

          {/* Right: result */}
          <section className={styles.resultSection}>
            {result ? (
              <ResultCard result={result} />
            ) : !loading ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="22" stroke="var(--border-glow)" strokeWidth="1.5" strokeDasharray="4 3"/>
                    <path d="M24 14v10l7 4" stroke="var(--border-glow)" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className={styles.emptyTitle}>Awaiting analysis</p>
                <p className={styles.emptyHint}>Submit text to see results here</p>
              </div>
            ) : null}
          </section>
        </div>

        {/* ── Media module placeholders ── */}
        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>EXPAND DETECTION</span>
          <span className={styles.dividerLine} />
        </div>

        <MediaPlaceholder />
      </main>

      <footer className={styles.footer}>
        <span>DeepFakeShield © 2025</span>
        <span className={styles.footerSep}>·</span>
        <span>Built for AI authenticity & truth</span>
        <span className={styles.footerSep}>·</span>
        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.footerLink}
        >
          API Docs ↗
        </a>
      </footer>
    </div>
  );
}

export default App;
