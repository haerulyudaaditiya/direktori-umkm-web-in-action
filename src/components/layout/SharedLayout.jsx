// src/SharedLayout.jsx (update)
import React from 'react';
import AnimatedOutlet from './AnimatedOutlet.jsx';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import FloatingCart from '../features/cart/FloatingCart.jsx';

function SharedLayout() {
  return (
    <div className="flex flex-col min-h-screen text-foreground">
      <Navbar />
      <main className="flex-1 relative z-10">
        <AnimatedOutlet />
      </main>
      <FloatingCart />
      <Footer />
    </div>
  );
}

export default SharedLayout;
