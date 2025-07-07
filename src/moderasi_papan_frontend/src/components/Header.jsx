import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../App';
import { Moon, Sun } from 'lucide-react';

const Header = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header className="header">
      <div className="logo">
        {/* <img src="/logo2.svg" alt="Logo" /> */}
        <span>Moderasi Papan</span>
      </div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/main">App</Link>
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </nav>
    </header>
  );
};

export default Header;