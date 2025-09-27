'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phase, setPhase] = useState<'login' | 'otp'>('login');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Login failed'); return; }
    if (data.requireOtp) {
      setPhase('otp');
      setMessage('OTP sent to your registered mobile number.');
    } else {
      window.location.href = data.redirect || '/';
    }
  }

  async function handleOtp(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, otp }),
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Invalid OTP'); return; }
    window.location.href = data.redirect || '/';
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded border">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      {phase === 'login' && (
        <form onSubmit={handleLogin} className="space-y-3">
          <input value={username} onChange={e=>setUsername(e.target.value)} className="input" placeholder="Username" />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input" placeholder="Password" />
          <button className="btn-primary" type="submit">Login</button>
        </form>
      )}
      {phase === 'otp' && (
        <form onSubmit={handleOtp} className="space-y-3">
          <input value={otp} onChange={e=>setOtp(e.target.value)} className="input" placeholder="Enter OTP" />
          <button className="btn-primary" type="submit">Verify OTP</button>
        </form>
      )}
      <p className="mt-4 text-sm text-gray-600">{message}</p>

      <hr className="my-6" />
      <div>
        <p className="mb-2">Register as:</p>
        <div className="flex gap-2">
          <a className="btn-outline" href="/register/vendor">Vendor</a>
          <a className="btn-outline" href="/register/partner">Partner</a>
          <a className="btn-outline" href="/register/customer">Customer</a>
        </div>
      </div>
    </div>
  );
}