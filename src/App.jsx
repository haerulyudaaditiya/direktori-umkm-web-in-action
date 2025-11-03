import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SharedLayout from './components/layout/SharedLayout';
import LandingPage from './pages/LandingPage';
import DirectoryPage from './pages/DirectoryPage';
import DetailPage from './pages/DetailPage';
import MenuPage from './pages/MenuPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<SharedLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="direktori" element={<DirectoryPage />} />
        <Route path="umkm/:slug" element={<DetailPage />} />
        <Route path="menu/:slug" element={<MenuPage />} />
      </Route>
    </Routes>
  );
}

export default App;
