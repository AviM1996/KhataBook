import styles from "./Loader.module.css";

export default function Loader({
  size = "medium",
  color = "green",
  text = null,
  className = "",
  ...props
}) {
  const sizeClass = styles[size] || styles.medium;
  const colorClass = styles[color] || styles.green;

  return (
    <div
      className={`${styles.loaderContainer} ${className}`}
      {...props}
    >
      <div className={`${styles.spinner} ${sizeClass} ${colorClass}`}>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
      </div>

      {text && <span className={styles.loaderText}>{text}</span>}
    </div>
  );
}