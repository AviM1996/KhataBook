import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Page.module.css';
import { Loader, LoaderOverlay } from '../../index';

const Page = ({
  title,
  subtitle,
  loading = false,
  fullscreenLoader = false,
  error = null,
  actions,
  showBack = false,
  onBack,
  className = '',
  children
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  if (loading && fullscreenLoader) {
    return <LoaderOverlay text={typeof loading === 'string' ? loading : 'Loading...'} />;
  }

  return (
    <div className={styles.pageContainer}>
      {/* HEADER SECTION */}
      {(title || subtitle || actions) && (
        <header className={styles.pageHeader}>
          <div className={styles.titleArea}>
            <div className={styles.titleWithBack}>
              {showBack && (
                <button 
                  className={styles.backBtn} 
                  onClick={handleBack} 
                  aria-label="Go back"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </button>
              )}
              {title && <h1 className={styles.title}>{title}</h1>}
            </div>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>

          {actions && <div className={styles.headerActions}>{actions}</div>}
        </header>
      )}

      {/* ERROR DISPLAY */}
      {error && (
        <div className={styles.errorContainer}>
          {error}
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className={`${styles.content} ${className}`}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Loader text={typeof loading === 'string' ? loading : 'Loading content...'} />
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
};

export default Page;
