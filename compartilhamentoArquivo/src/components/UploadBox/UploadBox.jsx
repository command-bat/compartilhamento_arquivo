import { useState } from "react";

import api from "../../services/api";

import styles from "./UploadBox.module.css";

function UploadBox() {
  const [file, setFile] = useState(null);

  const [password, setPassword] = useState("");

  const [quickDownload, setQuickDownload] = useState(true);

  const [expiresHours, setExpiresHours] = useState(24);

  const [dragging, setDragging] = useState(false);

  async function handleUpload() {
    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);

    formData.append("password", password);

    formData.append("quickDownload", quickDownload);

    formData.append("expiresHours", expiresHours);

    try {
      const response = await api.post("/upload", formData);

      alert(`Link criado: ${response.data.url}`);
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.error || "Erro ao enviar");
    }
  }

  function handlePasswordChange(value) {
    setPassword(value);

    if (value.trim() !== "") {
      setQuickDownload(false);
    }
  }

  function handleDrop(event) {
    event.preventDefault();

    setDragging(false);

    const droppedFile = event.dataTransfer.files[0];

    if (droppedFile) {
      setFile(droppedFile);
    }
  }

  function handleDragOver(event) {
    event.preventDefault();

    if (!dragging) {
      setDragging(true);
    }
  }

  function handleDragLeave(event) {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    setDragging(false);
  }

  return (
    <div
      className={styles.container}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className={styles.card}>
        <h1 className={styles.title}>Upload de Arquivo</h1>

        <label
          className={`
          ${styles.uploadArea}
          ${dragging ? styles.dragging : ""}
        `}
        >
          <input
            type="file"
            hidden
            onChange={(e) => setFile(e.target.files[0])}
          />

          {file ? (
            <div className={styles.fileInfo}>
              <span className={styles.fileName}>{file.name}</span>

              <span className={styles.fileSize}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          ) : (
            <div className={styles.uploadText}>
              <span>Arraste um arquivo</span>

              <span>ou clique para selecionar</span>
            </div>
          )}
        </label>

        <div className={styles.field}>
          <label>Senha</label>

          <input
            type="password"
            placeholder="Opcional"
            value={password}
            disabled={quickDownload}
            onChange={(e) => handlePasswordChange(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Expiração (horas)</label>

          <input
            type="number"
            min="1"
            value={expiresHours}
            onChange={(e) => setExpiresHours(e.target.value)}
          />
        </div>

        <label
          className={`
          ${styles.checkboxWrapper}
          ${password ? styles.disabled : ""}
        `}
        >
          <input
            type="checkbox"
            checked={quickDownload}
            disabled={password !== ""}
            onChange={(e) => setQuickDownload(e.target.checked)}
          />

          <span>Download rápido</span>
        </label>

        <button className={styles.button} onClick={handleUpload}>
          Enviar
        </button>
      </div>
    </div>
  );
}

export default UploadBox;
