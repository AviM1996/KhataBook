//full page loader
import Loader from "./Loader";
import styles from "./Loader.module.css";

export default function LoaderOverlay({
  text = "Loading...",
  color = "green"
}) {
  return (
    <div className={styles.overlay}>
      <Loader size="large" color={color} text={text} />
    </div>
  );
}