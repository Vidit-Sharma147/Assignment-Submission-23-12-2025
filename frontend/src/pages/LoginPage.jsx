import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestOtp, validateIdentifier } from '../services.js';


export default function LoginPage() {
  const [identifier, setIdentifier] = useState(localStorage.getItem('auth:identifier') || '');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formatMs = (ms) => {
    const s = Math.max(0, Math.round(ms / 1000));
    if (s < 60) return `${s}s`;
    const m = Math.ceil(s / 60);
    return `${m}m`;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!validateIdentifier(identifier)) {
      setError('Please enter a valid email or phone number.');
      return;
    }
    try {
      setLoading(true);
      const res = await requestOtp(identifier.trim());
      localStorage.setItem('auth:identifier', identifier.trim());
      setInfo(`OTP sent. Check server console for the code. Expires in ${res.expiresInMinutes}m.`);
      setTimeout(() => navigate('/verify'), 600);
    } catch (e) {
      if (e.details?.retryAfterMs) {
        setError(`${e.message} Please wait ~${formatMs(e.details.retryAfterMs)}.`);
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Login</h1>
        <span className="small">OTP-based Authentication</span>
      </header>
      <form onSubmit={onSubmit}>
        <label>Email or Phone</label>
        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="e.g. user@example.com or +11234567890"
          autoFocus
        />
        <button disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</button>
      </form>
      <div className="small" style={{ marginTop: 12 }}>
        Note: OTP codes are printed in the backend terminal (mock delivery).
      </div>
      {info && <div className="notice">{info}</div>}
      {error && <div className="notice error">{error}</div>}
    </div>
  );
}
