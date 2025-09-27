'use client';
import { useState } from 'react';

export default function PartnerRegisterPage() {
  const [vehicleType, setVehicleType] = useState<'BICYCLE'|'MOTORBIKE'>('BICYCLE');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [regionLat, setRegionLat] = useState('');
  const [regionLng, setRegionLng] = useState('');
  const [message, setMessage] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/register/partner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicleType, email, mobile, bankAccount, bankIfsc,
        loginLat: regionLat ? parseFloat(regionLat) : null,
        loginLng: regionLng ? parseFloat(regionLng) : null,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Failed'); return; }
    setMessage('Registration submitted. Profile verification takes 24 hrs.');
  }

  return (
    <div className="max-w-2xl mx-auto bg-white border rounded p-6">
      <h1 className="text-xl font-semibold mb-4">Register as Partner</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block mb-1">Vehicle Type</label>
          <select className="input" value={vehicleType} onChange={e=>setVehicleType(e.target.value as any)}>
            <option value="BICYCLE">Bicycle</option>
            <option value="MOTORBIKE">Motorbike</option>
          </select>
        </div>
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" placeholder="Mobile Number" value={mobile} onChange={e=>setMobile(e.target.value)} />
        <input className="input" placeholder="Bank Account" value={bankAccount} onChange={e=>setBankAccount(e.target.value)} />
        <input className="input" placeholder="Bank IFSC" value={bankIfsc} onChange={e=>setBankIfsc(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="Login Region Lat" value={regionLat} onChange={e=>setRegionLat(e.target.value)} />
          <input className="input" placeholder="Login Region Lng" value={regionLng} onChange={e=>setRegionLng(e.target.value)} />
        </div>
        <button className="btn-primary" type="submit">Submit</button>
      </form>
      <p className="mt-4 text-sm">{message}</p>
      <p className="mt-6 text-sm text-gray-600">
        Note: Kit fee (₹1200 + delivery) applies; login will be enabled after kit receipt confirmation.
      </p>
    </div>
  );
}