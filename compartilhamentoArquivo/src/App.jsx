import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home/index";
import Download from "./pages/Download/index";

function App() {
  return (
    <Routes>
      <Route path="*" element={<Home />} />
      <Route path="/:code" element={<Download />} />
    </Routes>
  );
}

export default App;
