import styles from "./BufferIcon.module.css";

/**
 * Custom animated buffer/loading spinner icon
 * Matches LedgerFlow brand design with green accent
 */
export default function BufferIcon({ 
  size = "medium", 
  color = "green",
  className = "",
  text = null 
}) {
  const sizeClass = styles[size] || styles.medium;
  const colorClass = styles[color] || styles.green;

  return (
    <div className={`${styles.bufferContainer} ${className}`}>
      <div className={`${styles.bufferIcon} ${sizeClass} ${colorClass}`}>
        <div className={styles.spinner}>
          <div className={styles.spinnerRing}></div>
          <div className={styles.spinnerRing}></div>
          <div className={styles.spinnerRing}></div>
        </div>
      </div>
      {text && <span className={styles.bufferText}>{text}</span>}
    </div>
  );
}

/**
 * Inline buffer icon for buttons and small spaces
 */
export function BufferIconInline({ size = "small", color = "green" }) {
  const sizeClass = styles[size] || styles.small;
  const colorClass = styles[color] || styles.green;

  return (
    <span className={`${styles.bufferIconInline} ${sizeClass} ${colorClass}`}>
      <div className={styles.spinner}>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
      </div>
    </span>
  );
}

