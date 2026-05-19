import { useEffect, useRef, useState } from "react";

import { FaChevronDown, FaTrashAlt } from "react-icons/fa";

import axios from "axios";

import api from "../../services/api";

import styles from "./FileOverlay.module.css";

import HeaderDownloadBar from "../HeaderDownloadBar/HeaderDownloadBar";

function FileOverlay({ code }) {
  const [fileData, setFileData] = useState(null);

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [progress, setProgress] = useState(0);

  const [downloading, setDownloading] = useState(false);

  const [finished, setFinished] = useState(false);

  const [minimized, setMinimized] = useState(false);

  const controllerRef = useRef(null);

  const [speed, setSpeed] = useState(0);

  const [miniHover, setMiniHover] = useState(false);

  const [canceled, setCanceled] = useState(false);

  useEffect(() => {
    fetchFile();
  }, [code]);

  async function fetchFile() {
    try {
      const response = await api.get(`/file/${code}`);

      setFileData(response.data);
      setLoading(false);

      if (response.data.quickDownload) {
        startDownload(response.data);
      }
    } catch {
      setError("Arquivo não encontrado");
      setLoading(false);
    }
  }

  async function startDownload(data) {
    try {
      setCanceled(false);
      setDownloading(true);
      setFinished(false);
      setProgress(0);

      controllerRef.current = new AbortController();

      const response = await axios({
        method: "GET",
        url:
          import.meta.env.VITE_API_URL +
          `/download/${code}` +
          (password ? `?password=${password}` : ""),

        responseType: "blob",
        signal: controllerRef.current.signal,

        onDownloadProgress: (progressEvent) => {
          if (!progressEvent.total) return;

          const percent = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100,
          );

          setProgress(percent);

          const bytesPerSecond = progressEvent.rate || 0;
          setSpeed(bytesPerSecond);
        },
      });

      const blob = new Blob([response.data]);
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = data.originalName;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      setProgress(100);
      setFinished(true);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError("Erro ao baixar");
      }
    } finally {
      setDownloading(false);
    }
  }

  function cancelDownload() {
    controllerRef.current?.abort();

    setDownloading(false);
    setFinished(false);
    setCanceled(true);
    setProgress(0);
    setSpeed(0);
  }

  if (!code) return null;

  return (
    <>
      {finished && !canceled && (
        <HeaderDownloadBar
          fileName={fileData.originalName}
          onDownload={() => startDownload(fileData)}
        />
      )}
      {minimized && (
        <div
          className={styles.minimizedBar}
          onMouseEnter={() => setMiniHover(true)}
          onMouseLeave={() => setMiniHover(false)}
          onClick={() => {
            if (!canceled) {
              setMinimized(false);
            }
          }}
        >
          <div className={styles.miniContent}>
            {!canceled && (
              <>
                <div className={styles.miniProgress}>
                  <div
                    className={styles.miniProgressFill}
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <span>{progress}%</span>

                {miniHover && (
                  <button
                    className={styles.trashIcon}
                    onClick={(e) => {
                      e.stopPropagation();

                      cancelDownload();
                    }}
                  >
                    <FaTrashAlt />
                  </button>
                )}
              </>
            )}

            {canceled && (
              <div className={styles.cancelBox}>
                <span>Download cancelado</span>

                <button
                  className={styles.redownloadMini}
                  onClick={(e) => {
                    e.stopPropagation();

                    startDownload(fileData);
                  }}
                >
                  Download novamente
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {!minimized && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            {loading ? (
              <div className={styles.loading}>Carregando...</div>
            ) : error ? (
              <div className={styles.error}>{error}</div>
            ) : (
              <>
                <div className={styles.topBar}>
                  <button
                    className={styles.minimizeButton}
                    onClick={() => setMinimized(true)}
                  >
                    <FaChevronDown />
                  </button>

                  <button
                    className={styles.trashButton}
                    onClick={(e) => {
                      e.stopPropagation();

                      cancelDownload();
                    }}
                  >
                    <FaTrashAlt />
                  </button>
                </div>

                <div className={styles.header}>
                  <h2>{fileData.originalName}</h2>

                  <span>{fileData.sizeFormatted}</span>
                </div>

                <div className={styles.progressWrapper}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                  <div className={styles.progressInfo}>
                    <span>{(speed / 1024 / 1024).toFixed(2)} MB/s</span>

                    <span>{progress}%</span>
                  </div>
                </div>

                {!downloading && !finished && fileData.requiresPassword && (
                  <input
                    type="password"
                    placeholder="Digite a senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.passwordInput}
                  />
                )}

                {!downloading && !finished && (
                  <button
                    className={styles.downloadButton}
                    onClick={() => startDownload(fileData)}
                  >
                    Baixar arquivo
                  </button>
                )}

                {finished && !minimized && (
                  <button
                    className={styles.downloadButton}
                    onClick={() => startDownload(fileData)}
                  >
                    Download novamente
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default FileOverlay;
