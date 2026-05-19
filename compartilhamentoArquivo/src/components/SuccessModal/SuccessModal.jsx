import { useState } from "react";

import { FaCopy, FaShareAlt, FaQrcode } from "react-icons/fa";

import { QRCodeCanvas } from "qrcode.react";

import styles from "./SuccessModal.module.css";

function SuccessModal({ url, onClose }) {
  const [showQR, setShowQR] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(url);

    alert("Link copiado");
  }

  async function shareLink() {
    if (navigator.share) {
      navigator.share({
        title: "Arquivo",
        url,
      });

      return;
    }

    copyLink();
  }

  function toggleQR() {
    setShowQR(!showQR);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Link criado</h2>

        <input value={url} readOnly />

        <div className={styles.actions}>
          <button onClick={copyLink}>
            <FaCopy />
            Copiar
          </button>

          <button onClick={shareLink}>
            <FaShareAlt />
            Compartilhar
          </button>
        </div>

        <button
          className={`
            ${styles.qrButton}
            ${showQR ? styles.activeQR : ""}
          `}
          onClick={toggleQR}
        >
          <FaQrcode />

          {showQR ? "Ocultar QR Code" : "Mostrar QR Code"}
        </button>

        <div
          className={`
            ${styles.qrWrapper}
            ${showQR ? styles.qrVisible : styles.qrHidden}
          `}
        >
          <div className={styles.qrBox}>
            <QRCodeCanvas value={url} size={180} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuccessModal;
