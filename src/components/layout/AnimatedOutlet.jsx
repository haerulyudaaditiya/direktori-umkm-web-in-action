import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion as Motion } from 'framer-motion'

function AnimatedOutlet() {
  const location = useLocation();

  return (
    // AnimatePresence "mendeteksi" saat komponen di dalamnya (Outlet)
    // akan diganti (berdasarkan 'location.pathname')
    <AnimatePresence mode="wait">
      <Motion.div
        key={location.pathname} // Kunci animasi adalah URL

        // Animasi Awal (Masuk)
        initial={{ opacity: 0, y: 15 }} // Mulai dari transparan & sedikit di bawah
        animate={{ opacity: 1, y: 0 }} // Jadi solid & di posisi normal

        // Animasi Keluar
        exit={{ opacity: 0, y: 15 }} // Menghilang & turun sedikit

        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <Outlet />
      </Motion.div>
    </AnimatePresence>
  )
}

export default AnimatedOutlet