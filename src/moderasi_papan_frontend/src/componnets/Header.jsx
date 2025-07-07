import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <img src="/logo2.svg" alt="Moderasi Papan Logo" />
        <span>Moderasi Papan</span>
      </div>
      <nav>
        <a href="/">Home</a>
        <a href="/main">App</a>
      </nav>
    </header>
  );
};

export default Header;