'use client';
import { useState } from 'react';

export default function CustomerRegisterPage() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState<'Male'|'Female'|'Other'|''>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    if (password !== confirm) {
      setMessage('Passwords do not match');
      return;
    }
    const res = await fetch('/api/register/customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, mobile, gender, email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Failed'); return; }
    setMessage(`Registered. Your Customer ID: ${data.customerId}. Welcome message sent.`);
  }

  return (
    <div className="max-w-md mx-auto bg-white border rounded p-6">
      <h1 className="text-xl font-semibold mb-4">Register as Customer</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="input" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="input" placeholder="Mobile Number" value={mobile} onChange={e=>setMobile(e.target.value)} />
        <select className="input" value={gender} onChange={e=>setGender(e.target.value as any)}>
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
        <input className="input" placeholder="Email (optional)" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <input className="input" type="password" placeholder="Confirm Password" value={confirm} onChange={e=>setConfirm(e.target.value)} />
        <button className="btn-primary" type="submit">Submit</button>
      </form>
      <p className="mt-4 text-sm">{message}</p>
    </div>
  );
}