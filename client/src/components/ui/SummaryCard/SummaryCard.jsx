import React from 'react';
import styles from './SummaryCard.module.css';

/**
 * Reusable Metric Tile/Card Component with optional growth indicator
 * @param {string} label - The descriptive title of the card
 * @param {string|number} value - The main metric value
 * @param {string} [color=''] - Optional color class (e.g. 'green', 'red', 'blue', 'danger')
 * @param {boolean} [isLoading=false] - Whether the card is currently loading data
 * @param {function} [onClick] - Optional click handler
 * @param {number} [growth] - Growth percentage (positive = up, negative = down)
 * @param {string} [growthLabel] - Growth period label (e.g. "vs last week")
 */
export default function SummaryCard({
  label,
  value,
  color = '',
  isLoading = false,
  onClick,
  growth,
  growthLabel = '',
  icon,
}) {
  const isClickable = typeof onClick === 'function';
  const hasGrowth = typeof growth === 'number' && !isNaN(growth);
  const isPositive = growth >= 0;

  return (
    <div
      className={`${styles.card} ${color ? styles[color] : ''} ${isClickable ? styles.clickable : ''}`}
      onClick={onClick}
      style={{ cursor: isClickable ? 'pointer' : 'default' }}
    >
      <div className={styles.cardHeader}>
        <p>{label}</p>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>
      {isLoading ? (
        <span className={styles.loading}>Loading...</span>
      ) : (
        <>
          <h3>{value}</h3>
          {hasGrowth && (
            <span className={`${styles.growth} ${isPositive ? styles.growthUp : styles.growthDown}`}>
              {isPositive ? '↑' : '↓'} {Math.abs(growth)}%{growthLabel ? ` ${growthLabel}` : ''}
            </span>
          )}
        </>
      )}
    </div>
  );
}
