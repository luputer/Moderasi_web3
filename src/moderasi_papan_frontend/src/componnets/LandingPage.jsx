
import React from 'react';
import Web3DAnimation from './Web3DAnimation';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Web3DAnimation />
      <section className="hero">
        <h1>Selamat Datang di Moderasi Papan</h1>
        <p>Platform terdesentralisasi untuk berbagi ide dan berdiskusi.</p>
        <button onClick={() => window.location.href = '/main'}>Mulai Sekarang</button>
      </section>
      <section className="features">
        <h2>Fitur Utama</h2>
        <div className="feature-list">
          <div className="feature-item">
            <h3>Desentralisasi Penuh</h3>
            <p>Dibangun di atas Internet Computer, memastikan sensor-resistance dan ketersediaan tinggi.</p>
          </div>
          <div className="feature-item">
            <h3>Identitas Aman</h3>
            <p>Gunakan Internet Identity untuk login yang aman dan anonim.</p>
          </div>
          <div className="feature-item">
            <h3>Konten Terverifikasi</h3>
            <p>Sistem moderasi berbasis komunitas untuk menjaga kualitas diskusi.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
