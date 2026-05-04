import React from 'react';
import styles from './Header.module.css';

const Header = () => (
  <header className={styles.header}>
    <div className={styles.logoRow}>
      <div className={styles.shieldIcon}>
        <svg width="32" height="36" viewBox="0 0 32 36" fill="none">
          <path
            d="M16 1L2 7v10c0 9.4 6 18.1 14 21 8-2.9 14-11.6 14-21V7L16 1z"
            stroke="var(--accent)" strokeWidth="1.5" fill="none"
          />
          <path
            d="M16 8L8 11.5v6c0 5.2 3.4 10 8 11.6 4.6-1.6 8-6.4 8-11.6v-6L16 8z"
            fill="var(--accent)" opacity="0.15"
          />
          <line x1="10" y1="18" x2="14" y2="22" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
          <line x1="14" y1="22" x2="22" y2="13" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <div>
        <h1 className={styles.title}>DeepFakeShield</h1>
        <p className={styles.subtitle}>AI-Powered Authenticity Detection</p>
      </div>
    </div>
    <nav className={styles.nav}>
      <span className={styles.badge}>v1.0</span>
      <span className={styles.statusDot} title="System Online" />
    </nav>
  </header>
);

export default Header;
