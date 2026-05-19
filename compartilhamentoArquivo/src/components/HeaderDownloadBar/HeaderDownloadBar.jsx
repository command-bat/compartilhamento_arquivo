import styles from "./HeaderDownloadBar.module.css";

function HeaderDownloadBar({ fileName, onDownload }) {
  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <span className={styles.label}>Último download</span>

        <span className={styles.fileName}>{fileName}</span>
      </div>

      <button className={styles.button} onClick={onDownload}>
        Re-download
      </button>
    </div>
  );
}

export default HeaderDownloadBar;
