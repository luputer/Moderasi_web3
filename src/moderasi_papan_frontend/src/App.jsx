
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import Header from './componnets/Header';
import Footer from './componnets/Footer';
import LandingPage from './componnets/LandingPage';
import MainApp from './componnets/MainApp';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/main" element={<MainApp />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;


