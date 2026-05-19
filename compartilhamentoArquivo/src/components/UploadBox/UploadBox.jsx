import { useState } from "react";

import api from "../../services/api";

import styles from "./UploadBox.module.css";

import { AnimatePresence, motion } from "framer-motion";

import SuccessModal from "../SuccessModal/SuccessModal";

function UploadBox() {
  const [file, setFile] = useState(null);

  const [password, setPassword] = useState("");

  const [quickDownload, setQuickDownload] = useState(true);

  const [expiresAt, setExpiresAt] = useState(() => {
    const now = new Date();
    now.setHours(now.getHours() + 24); // padrão 24h
    return now.toISOString().slice(0, 16); // formato datetime-local
  });

  const [dragging, setDragging] = useState(false);

  const [uploadedUrl, setUploadedUrl] = useState("");

  const [showFastDates, setShowFastDates] = useState(false);

  async function handleUpload() {
    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);

    formData.append("password", password);

    formData.append("quickDownload", quickDownload);

    formData.append("expiresAt", new Date(expiresAt).toISOString());

    try {
      const response = await api.post("/upload", formData);

      setUploadedUrl(response.data.url);
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.error || "Erro ao enviar: " + err);
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

  function formatDateInput(date) {
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  }

  function addTime(minutes = 0, hours = 0, days = 0) {
    const d = new Date(expiresAt);

    d.setMinutes(d.getMinutes() + minutes);
    d.setHours(d.getHours() + hours);
    d.setDate(d.getDate() + days);

    setExpiresAt(formatDateInput(d));
  }

  function subTime(minutes = 0, hours = 0, days = 0) {
    const d = new Date(expiresAt);

    d.setMinutes(d.getMinutes() - minutes);
    d.setHours(d.getHours() - hours);
    d.setDate(d.getDate() - days);

    setExpiresAt(formatDateInput(d));
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

        <div className={styles.modeSelector}>
          <button
            className={quickDownload ? styles.activeMode : ""}
            onClick={() => {
              setQuickDownload(true);
              setPassword("");
            }}
          >
            Fast Download
          </button>

          <button
            className={!quickDownload ? styles.activeMode : ""}
            onClick={() => setQuickDownload(false)}
          >
            Protegido
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!quickDownload && (
            <motion.div
              className={styles.passwordWrapper}
              initial={{
                opacity: 0,
                y: -15,
                height: 0,
              }}
              animate={{
                opacity: 1,
                y: 0,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                y: -15,
                height: 0,
              }}
              transition={{
                duration: 0.25,
                ease: "easeInOut",
              }}
            >
              <div className={styles.field}>
                <label>Senha</label>

                <input
                  type="password"
                  placeholder="Digite a senha"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={styles.field}>
          <label>Expiração</label>

          <div className={styles.expiryHeader}>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />

            <button
              type="button"
              className={styles.toggleFastBtn}
              onClick={() => setShowFastDates((s) => !s)}
            >
              {showFastDates ? "Ocultar atalhos" : "Atalhos"}
            </button>
          </div>
          <AnimatePresence>
            {showFastDates && (
              <motion.div
                className={styles.fastDates}
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className={styles.fastSumtime}>
                  <div className={styles.tenMinutes}>
                    <button onClick={() => addTime(10)}>+10 Min</button>
                    <button onClick={() => subTime(10)}>-10 Min</button>
                  </div>

                  <div className={styles.oneHour}>
                    <button onClick={() => addTime(0, 1)}>+1 Hora</button>
                    <button onClick={() => subTime(0, 1)}>-1 Hora</button>
                  </div>

                  <div className={styles.oneDay}>
                    <button onClick={() => addTime(0, 0, 1)}>+1 Dia</button>
                    <button onClick={() => subTime(0, 0, 1)}>-1 Dia</button>
                  </div>
                </div>

                <div className={styles.fastSetDates}>
                  <button
                    onClick={() => {
                      const d = new Date();
                      d.setHours(d.getHours() + 1);
                      setExpiresAt(formatDateInput(d));
                    }}
                  >
                    1 Hora
                  </button>

                  <button
                    onClick={() => {
                      const d = new Date();
                      d.setHours(d.getHours() + 24);
                      setExpiresAt(formatDateInput(d));
                    }}
                  >
                    24 Horas
                  </button>

                  <button
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 7);
                      setExpiresAt(formatDateInput(d));
                    }}
                  >
                    7 Dias
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button className={styles.button} onClick={handleUpload}>
          Enviar
        </button>
      </div>

      {uploadedUrl && (
        <SuccessModal url={uploadedUrl} onClose={() => setUploadedUrl("")} />
      )}
    </div>
  );
}

export default UploadBox;
