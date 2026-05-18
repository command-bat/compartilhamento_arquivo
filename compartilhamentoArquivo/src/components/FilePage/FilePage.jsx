import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import api from "../../services/api";

import styles from "./FilePage.module.css";

function FilePage() {
  const { code } = useParams();

  const [fileData, setFileData] = useState(null);

  const [password, setPassword] = useState("");

  useEffect(() => {
    fetchFile();
  }, []);

  async function fetchFile() {
    try {
      const response = await api.get(`/file/${code}`);

      if (response.data.quickDownload) {
        window.location.href = `https://api.commandbat.com.br/download/${code}`;

        return;
      }

      setFileData(response.data);
    } catch (err) {
      alert("Arquivo não encontrado");
    }
  }

  async function handleDownload() {
    window.location.href = `https://api.commandbat.com.br/download/${code}?password=${password}`;
  }

  if (!fileData) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.fileName}>{fileData.originalName}</h1>

        <div className={styles.info}>
          <span>{fileData.sizeFormatted}</span>

          <span>{fileData.mimetype}</span>
        </div>

        {fileData.requiresPassword && (
          <input
            className={styles.passwordInput}
            type="password"
            placeholder="Digite a senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        <button className={styles.downloadButton} onClick={handleDownload}>
          Baixar arquivo
        </button>
      </div>
    </div>
  );
}

export default FilePage;
