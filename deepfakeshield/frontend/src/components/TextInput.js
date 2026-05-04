import React, { useState } from 'react';
import styles from './TextInput.module.css';

const EXAMPLE_TEXTS = [
  {
    label: 'AI-style',
    text: 'Furthermore, it is important to note that the utilization of artificial intelligence has fundamentally transformed modern workflows. In conclusion, leveraging cutting-edge machine learning algorithms enables unprecedented capabilities and plays a pivotal role in shaping the future of various industries.',
  },
  {
    label: 'Human-style',
    text: "I'm honestly not sure what to make of this whole AI thing. Like, sure, it's cool, but it also freaks me out a little? My friend showed me this chatbot last week and I couldn't tell if it was joking or serious half the time.",
  },
  {
    label: 'Misinformation',
    text: "Scientists confirm that 5G towers are secretly spreading a new virus. This is a proven fact that mainstream media doesn't want you to know. The government is covering up this shocking truth. Wake up, sheeple!",
  },
];

const TextInput = ({ onAnalyze, loading }) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!loading && text.trim().length >= 10) onAnalyze(text);
  };

  const handleKey = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit();
  };

  const charCount = text.length;
  const isReady = charCount >= 10 && !loading;

  return (
    <div className={styles.container}>
      <div className={styles.labelRow}>
        <label className={styles.label} htmlFor="textInput">
          <span className={styles.labelAccent}>{'>'}</span> INPUT TEXT
        </label>
        <span className={styles.charCount} data-warn={charCount > 8000}>
          {charCount.toLocaleString()} / 10,000
        </span>
      </div>

      <div className={styles.textareaWrapper} data-focused={undefined}>
        <textarea
          id="textInput"
          className={styles.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Paste text here to analyze for AI authorship and misinformation…"
          maxLength={10000}
          spellCheck={false}
          rows={8}
        />
        {loading && <div className={styles.scanLine} />}
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.examples}>
          <span className={styles.examplesLabel}>Try example:</span>
          {EXAMPLE_TEXTS.map((ex) => (
            <button
              key={ex.label}
              className={styles.exampleBtn}
              onClick={() => setText(ex.text)}
              disabled={loading}
            >
              {ex.label}
            </button>
          ))}
        </div>

        <button
          className={styles.analyzeBtn}
          onClick={handleSubmit}
          disabled={!isReady}
          aria-label="Analyze text"
        >
          {loading ? (
            <span className={styles.loadingContent}>
              <span className={styles.spinner} />
              ANALYZING…
            </span>
          ) : (
            <span>ANALYZE →</span>
          )}
        </button>
      </div>

      <p className={styles.hint}>Ctrl+Enter to analyze</p>
    </div>
  );
};

export default TextInput;
