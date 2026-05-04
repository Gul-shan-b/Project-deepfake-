import React from 'react';
import styles from './MediaPlaceholder.module.css';

const MODULES = [
  {
    id: 'image',
    icon: '🖼',
    label: 'Image Deepfake',
    desc: 'Detect manipulated or AI-generated images using CNN-based artifact detection and facial inconsistency analysis.',
    status: 'COMING SOON',
    tags: ['ResNet-50', 'FaceForensics++', 'ELA Analysis'],
  },
  {
    id: 'video',
    icon: '🎬',
    label: 'Video Deepfake',
    desc: 'Frame-by-frame temporal analysis to detect synthetic video generation and face-swap artifacts.',
    status: 'IN DEVELOPMENT',
    tags: ['ViT', 'Optical Flow', 'Temporal Consistency'],
  },
  {
    id: 'audio',
    icon: '🎙',
    label: 'Audio Deepfake',
    desc: 'Spectrogram analysis and voice cloning detection to identify AI-synthesized speech.',
    status: 'PLANNED',
    tags: ['Mel Spectrograms', 'RawNet2', 'AASIST'],
  },
];

const MediaPlaceholder = () => (
  <div className={styles.wrapper}>
    <div className={styles.sectionHeader}>
      <span className={styles.sectionLabel}>{'>'} UPCOMING MODULES</span>
      <span className={styles.sectionHint}>Non-functional – roadmap preview</span>
    </div>
    <div className={styles.grid}>
      {MODULES.map((mod) => (
        <div key={mod.id} className={styles.moduleCard}>
          <div className={styles.moduleTop}>
            <span className={styles.moduleIcon}>{mod.icon}</span>
            <span className={`${styles.statusBadge} ${styles[`status_${mod.status.split(' ')[0].toLowerCase()}`]}`}>
              {mod.status}
            </span>
          </div>
          <h3 className={styles.moduleTitle}>{mod.label} Detection</h3>
          <p className={styles.moduleDesc}>{mod.desc}</p>
          <div className={styles.moduleTags}>
            {mod.tags.map((t) => (
              <span key={t} className={styles.moduleTag}>{t}</span>
            ))}
          </div>
          <button className={styles.moduleBtn} disabled>
            UPLOAD {mod.id.toUpperCase()} ↑
          </button>
        </div>
      ))}
    </div>
  </div>
);

export default MediaPlaceholder;
