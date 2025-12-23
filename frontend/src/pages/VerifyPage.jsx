import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { verifyOtp } from '../services.js';

export default function VerifyPage() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');
  const navigate = useNavigate();
  const identifier = localStorage.getItem('auth:identifier') || '';

  useEffect(() => {
    if (!identifier) navigate('/login');
  }, [identifier, navigate]);

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
    const trimmed = otp.trim();
    const numeric = /^[0-9]{6}$/;
    if (!numeric.test(trimmed)) {
      setError('Enter the 6-digit OTP.');
      return;
    }
    try {
      setLoading(true);
      const res = await verifyOtp(identifier, trimmed);
      localStorage.setItem('auth:token', res.token);
      setInfo('Verified! Redirecting...');
      setTimeout(() => navigate('/welcome'), 600);
    } catch (e) {
      if (e.details?.remainingTries !== undefined) {
        setError(`${e.message} (${e.details.remainingTries} tries left)`);
      } else if (e.details?.retryAfterMs) {
        setError(`${e.message} Try again in ~${formatMs(e.details.retryAfterMs)}.`);
      } else if (e.details?.blockMinutes) {
        setError(`${e.message} Block lasts ~${e.details.blockMinutes}m.`);
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
        <h1>Verify OTP</h1>
        <span className="small">Sent to {identifier || '—'}</span>
      </header>
      <form onSubmit={onSubmit}>
        <label>One-Time Password</label>
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-digit OTP"
          inputMode="numeric"
          maxLength={6}
          pattern="[0-9]{6}"
        />
        <button disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
      </form>
      <div className="small" style={{ marginTop: 12 }}>
        Didn't get it? OTP is logged in server console.
      </div>
      <div style={{ marginTop: 8 }}>
        <Link className="link" to="/login">Change identifier</Link>
      </div>
      {info && <div className="notice">{info}</div>}
      {error && <div className="notice error">{error}</div>}
    </div>
  );
}
