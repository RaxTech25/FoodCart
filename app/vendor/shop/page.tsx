'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('../../../components/map/MapPicker'), { ssr: false });

export default function VendorShopPage() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/vendor/shop');
      const data = await res.json();
      if (res.ok && data.shop) {
        setName(data.shop.name || '');
        setAddress(data.shop.address || '');
        setLat(String(data.shop.lat ?? ''));
        setLng(String(data.shop.lng ?? ''));
        setAuthorized(!!data.shop.authorized);
      }
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/vendor/shop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, address,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        authorized,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Save failed'); return; }
    setMessage('Shop details saved.');
  }

  async function setFromBrowserLocation() {
    setMessage('');
    if (!navigator.geolocation) { setMessage('Geolocation not available'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(String(pos.coords.latitude));
        setLng(String(pos.coords.longitude));
      },
      () => setMessage('Failed to read location'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleMapChange(newLat: number, newLng: number) {
    setLat(String(newLat));
    setLng(String(newLng));
  }

  return (
    <div className="max-w-2xl mx-auto bg-white border rounded p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Vendor Shop Location</h1>
      <form onSubmit={save} className="space-y-3">
        <input className="input" placeholder="Shop Name" value={name} onChange={e=>setName(e.target.value)} />
        <textarea className="input" placeholder="Shop Address" value={address} onChange={e=>setAddress(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="Latitude" value={lat} onChange={e=>setLat(e.target.value)} />
          <input className="input" placeholder="Longitude" value={lng} onChange={e=>setLng(e.target.value)} />
        </div>
        <MapPicker lat={lat ? parseFloat(lat) : undefined} lng={lng ? parseFloat(lng) : undefined} onChange={handleMapChange} />
        <div className="flex items-center gap-2">
          <input id="auth" type="checkbox" checked={authorized} onChange={e=>setAuthorized(e.target.checked)} />
          <label htmlFor="auth">Authorized (licensed shop)</label>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline" type="button" onClick={setFromBrowserLocation}>Use My Current Location</button>
          <button className="btn-primary" type="submit">Save</button>
        </div>
      </form>
      <p className="text-sm">{message}</p>
      <p className="text-xs text-gray-600">Click on the map to set shop location. Accurate coordinates enable better partner assignment and customer delivery.</p>
    </div>
  );
}