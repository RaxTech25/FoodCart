'use client';
import { useEffect, useState } from 'react';

type Order = {
  id: number;
  total: string;
  vendor: { shop?: { lat: number; lng: number } | null };
};

export default function PartnerHome() {
  const [online, setOnline] = useState(false);
  const [message, setMessage] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);

  async function getLocation(): Promise<{ lat: number; lng: number } | null> {
    return new Promise(resolve => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  async function startSession() {
    setMessage('');
    const loc = await getLocation();
    if (!loc) { setMessage('Enable location to start session'); return; }
    const res = await fetch('/api/partner/session/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loc),
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Failed to start'); return; }
    setOnline(true);
    loadFeed();
  }

  async function stopSession() {
    setMessage('');
    const res = await fetch('/api/partner/session/stop', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Failed to stop'); return; }
    setOnline(false);
    setOrders([]);
    setMessage(`Session ended (${data.totalMinutes ?? 0} minutes)`);
  }

  async function loadFeed() {
    const res = await fetch('/api/partner/orders/feed');
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Failed to load feed'); return; }
    setOrders(data.orders || []);
  }

  async function claim(orderId: number) {
    setMessage('');
    const res = await fetch('/api/partner/orders/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Failed to claim'); return; }
    setMessage(`Claimed order ${orderId}`);
    loadFeed();
  }

  useEffect(() => {
    if (online) loadFeed();
  }, [online]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Partner Dashboard</h1>
      <div className="bg-white border rounded p-4">
        <p className="mb-2 text-sm">Geofenced login within 5 km of your registered region.</p>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={startSession} disabled={online}>Start Ride</button>
          <button className="btn-outline" onClick={stopSession} disabled={!online}>Stop Ride</button>
        </div>
        <p className="text-sm mt-2">{message}</p>
      </div>

      <div className="bg-white border rounded p-4">
        <h2 className="font-medium mb-2">Nearby Orders</h2>
        {orders.length === 0 && <p className="text-sm">No orders nearby.</p>}
        <ul className="space-y-2">
          {orders.map(o => (
            <li key={o.id} className="border rounded p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">Order #{o.id}</div>
                <div className="text-xs text-gray-600">Total: ₹{o.total}</div>
              </div>
              <button className="btn-outline" onClick={() => claim(o.id)}>Accept</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}