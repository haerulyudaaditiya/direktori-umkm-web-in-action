import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import DirectoryPage from "./pages/DirectoryPage";
import DetailPage from "./pages/DetailPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/direktori" element={<DirectoryPage />} />
      <Route path="/umkm/:slug" element={<DetailPage />} />
    </Routes>
  );
}

export default App;
