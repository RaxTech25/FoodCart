'use client';
import { useEffect, useState } from 'react';

type Product = {
  id: number;
  name: string;
  description?: string;
  price: string;
  commissionRate: number;
  imageUrl?: string;
  active: boolean;
};

export default function VendorProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [commissionRate, setCommissionRate] = useState('0.10');
  const [imageUrl, setImageUrl] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const res = await fetch('/api/vendor/products');
    const data = await res.json();
    if (res.ok) setProducts(data.products || []);
  }

  useEffect(() => { load(); }, []);

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/vendor/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, price, commissionRate: parseFloat(commissionRate), imageUrl }),
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Failed to add product'); return; }
    setName(''); setDescription(''); setPrice(''); setCommissionRate('0.10'); setImageUrl('');
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Vendor Products</h1>

      <form onSubmit={addProduct} className="bg-white border rounded p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
          <input className="input" placeholder="Price (e.g., 199.00)" value={price} onChange={e=>setPrice(e.target.value)} />
        </div>
        <input className="input" placeholder="Commission Rate (e.g., 0.10)" value={commissionRate} onChange={e=>setCommissionRate(e.target.value)} />
        <input className="input" placeholder="Image URL (optional)" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} />
        <textarea className="input" placeholder="Description (optional)" value={description} onChange={e=>setDescription(e.target.value)} />
        <button className="btn-primary" type="submit">Add Product</button>
        <p className="text-sm">{message}</p>
      </form>

      <div className="bg-white border rounded p-4">
        <h2 className="font-medium mb-3">Your Products</h2>
        <ul className="space-y-2">
          {products.map(p => (
            <li key={p.id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-600">Price: ₹{p.price} • Commission: {(p.commissionRate*100).toFixed(0)}%</div>
                </div>
                {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-cover rounded" />}
              </div>
              <p className="text-sm mt-2">{p.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}