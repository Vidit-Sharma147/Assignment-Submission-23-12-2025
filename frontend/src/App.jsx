import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import VerifyPage from './pages/VerifyPage.jsx';
import WelcomePage from './pages/WelcomePage.jsx';

export default function App() {
  const navigate = useNavigate();
  useEffect(() => {
    if (location.pathname === '/') navigate('/login');
  }, [navigate]);
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/welcome" element={<WelcomePage />} />
    </Routes>
  );
}
