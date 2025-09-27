'use client';
import { useEffect, useState } from 'react';

type Order = {
  id: number;
  status: string;
  total: string;
  expiresAt?: string;
  createdAt: string;
};

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const res = await fetch('/api/vendor/orders');
    const data = await res.json();
    if (res.ok) setOrders(data.orders || []);
  }

  useEffect(() => { load(); }, []);

  async function accept(id: number) {
    setMessage('');
    const res = await fetch('/api/vendor/orders/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Failed to accept'); return; }
    load();
  }

  async function reject(id: number) {
    setMessage('');
    const res = await fetch('/api/vendor/orders/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Failed to reject'); return; }
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Vendor Orders</h1>
      <p className="text-sm text-gray-600">Accept or reject orders. Orders auto-reject after 5 minutes if not accepted.</p>
      <p className="text-sm">{message}</p>

      <div className="bg-white border rounded p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Order ID</th>
              <th className="p-2">Status</th>
              <th className="p-2">Total</th>
              <th className="p-2">Expires</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-t">
                <td className="p-2">{o.id}</td>
                <td className="p-2">{o.status}</td>
                <td className="p-2">₹{o.total}</td>
                <td className="p-2">{o.expiresAt ? new Date(o.expiresAt).toLocaleTimeString() : '-'}</td>
                <td className="p-2">
                  <button className="btn-outline mr-2" onClick={() => accept(o.id)} disabled={o.status !== 'PENDING'}>Accept</button>
                  <button className="btn-outline" onClick={() => reject(o.id)} disabled={o.status !== 'PENDING'}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}