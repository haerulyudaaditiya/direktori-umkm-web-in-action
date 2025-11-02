// Cek file: src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DetailPage from "./pages/DetailPage";

function App() {
  // Isinya HANYA ini. Tidak ada useState, useEffect, atau <div>
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/umkm/:slug" element={<DetailPage />} />
    </Routes>
  );
}

export default App;
