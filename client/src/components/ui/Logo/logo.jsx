import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './logo.module.css';

function Logo({ noMargin }) {
    const navigate = useNavigate();

    return (
        <div
            className={`${styles.logo} ${noMargin ? styles.noMargin : ''}`.trim()}
            onClick={() => navigate('/dashboard')}
            style={{ cursor: 'pointer' }}
            title="Go to Dashboard"
        >
            <div className={styles.icon}>
                <span className={styles.bar + " " + styles.dark}></span>
                <span className={styles.bar + " " + styles.green}></span>
                <span className={styles.check}></span>
            </div>
            <div className={styles.branding}>
                <div className={styles.brand}>
                    Ledger<span>Flow</span>
                </div>
                <div className={styles.tagline}>Smart Accounting</div>
            </div>
        </div>
    );
}

export default Logo;