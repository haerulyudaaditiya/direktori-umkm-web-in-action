import React from 'react';
import { Outlet } from 'react-router-dom'; // <-- HAPUS IMPORT INI
import AnimatedOutlet from './AnimatedOutlet'; // <-- 1. IMPORT INI
import Navbar from './Navbar';
import Footer from './Footer';

function SharedLayout() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <AnimatedOutlet /> {/* <-- 2. GANTI <Outlet /> DENGAN INI */}
      </main>
      <Footer />
    </div>
  );
}

export default SharedLayout;
