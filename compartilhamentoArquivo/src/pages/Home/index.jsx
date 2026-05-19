import { useState } from "react";

import { useLocation } from "react-router-dom";

import UploadBox from "../../components/UploadBox/UploadBox";

import FileOverlay from "../../components/FileOverlay/FileOverlay";

import HeaderDownloadBar from "../../components/HeaderDownloadBar/HeaderDownloadBar";

function Home() {
  const location = useLocation();

  const code = location.pathname.replace("/", "");

  const [downloadedFile, setDownloadedFile] = useState(null);

  return (
    <>
      {downloadedFile && (
        <HeaderDownloadBar
          fileName={downloadedFile.name}
          onDownload={downloadedFile.redownload}
        />
      )}

      <UploadBox />

      {code && <FileOverlay code={code} onDownloaded={setDownloadedFile} />}
    </>
  );
}

export default Home;
