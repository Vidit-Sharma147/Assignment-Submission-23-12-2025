const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export function validateIdentifier(id) {
  if (!id || typeof id !== 'string') return false;
  const s = id.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+]?[- 0-9]{6,15}$/;
  return emailRegex.test(s) || phoneRegex.test(s);
}

export async function requestOtp(identifier) {
  const res = await fetch(`${API_BASE}/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier })
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'Failed to request OTP');
    err.details = data;
    throw err;
  }
  return data;
}

export async function verifyOtp(identifier, otp) {
  const res = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, otp })
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'Failed to verify OTP');
    err.details = data;
    throw err;
  }
  return data;
}

export async function fetchMe(token) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'Unauthorized');
    err.details = data;
    throw err;
  }
  return data;
}
