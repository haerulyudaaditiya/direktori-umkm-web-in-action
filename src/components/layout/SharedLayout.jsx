import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function SharedLayout() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      {/* 'flex-1' memaksa 'main' untuk mengisi sisa ruang, mendorong Footer ke bawah */}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default SharedLayout;
