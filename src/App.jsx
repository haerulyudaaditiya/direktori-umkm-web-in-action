import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import Halaman dan Layout
import SharedLayout from './components/layout/SharedLayout';
import LandingPage from './pages/LandingPage';
import DirectoryPage from './pages/DirectoryPage';
import DetailPage from './pages/DetailPage';

function App() {
  return (
    <Routes>
      {/* Semua rute di dalam <SharedLayout> akan di-render di dalam <Outlet />.
        Ini memastikan Navbar dan Footer konsisten di semua halaman.
      */}
      <Route path="/" element={<SharedLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="direktori" element={<DirectoryPage />} />
        <Route path="umkm/:slug" element={<DetailPage />} />

        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Route>
    </Routes>
  );
}

export default App;
