
import React from 'react';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <section className="hero">
        <h1>Selamat Datang di Moderasi Papan</h1>
        <p>Platform untuk diskusi dan berbagi ide secara terbuka dan aman.</p>
        <button onClick={() => window.location.href = '/main'}>Mulai</button>
      </section>
      <section className="features">
        <h2>Fitur Utama</h2>
        <div className="feature-list">
          <div className="feature-item">
            <h3>Diskusi Terbuka</h3>
            <p>Bagikan ide dan pendapat Anda dengan komunitas.</p>
          </div>
          <div className="feature-item">
            <h3>Moderasi Konten</h3>
            <p>Sistem moderasi untuk menjaga diskusi tetap sehat.</p>
          </div>
          <div className="feature-item">
            <h3>Aman dan Terpercaya</h3>
            <p>Dibangun di atas Internet Computer untuk keamanan data.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
