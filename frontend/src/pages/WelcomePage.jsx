import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMe } from '../services.js';

export default function WelcomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('auth:token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMe(token)
      .then((data) => setUser(data.user))
      .catch(() => {
        setError('Session expired. Please login again.');
        localStorage.removeItem('auth:token');
        navigate('/login');
      });
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('auth:token');
    localStorage.removeItem('auth:identifier');
    navigate('/login');
  };

  return (
    <div className="container">
      <header>
        <h1>Welcome</h1>
        <button onClick={logout} style={{ width: 'auto', padding: '8px 12px' }}>Logout</button>
      </header>
      {user ? (
        <>
          <p>Logged in as:</p>
          <div className="notice">{user.displayName} ({user.id})</div>
        </>
      ) : (
        <p>Loading...</p>
      )}
      {error && <div className="notice error" style={{ marginTop: 12 }}>{error}</div>}
    </div>
  );
}
