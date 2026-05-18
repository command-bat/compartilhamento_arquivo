import { Routes, Route } from "react-router-dom";

import Home from "./pages/home/index.jsx";
import Download from "./pages/Download/index.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:code" element={<Download />} />
    </Routes>
  );
}

export default App;
