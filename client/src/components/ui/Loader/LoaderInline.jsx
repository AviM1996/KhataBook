//Button loader
import styles from "./Loader.module.css";

export default function LoaderInline({
  size = "small",
  color = "green"
}) {
  const sizeClass = styles[size] || styles.small;
  const colorClass = styles[color] || styles.green;

  return (
    <span className={`${styles.spinner} ${sizeClass} ${colorClass}`}>
      <div className={styles.spinnerRing}></div>
      <div className={styles.spinnerRing}></div>
      <div className={styles.spinnerRing}></div>
    </span>
  );
}