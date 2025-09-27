'use client';
import { useState } from 'react';

export default function VendorRegisterPage() {
  const [shopType, setShopType] = useState<'RESTAURANT_HOTEL'|'PUSH_CART'|'GROCERY'>('RESTAURANT_HOTEL');
  const [groceryType, setGroceryType] = useState<'SMALL_STORE'|'SUPERMARKET'|'HYPERMARKET'|''>('');
  const [vegetarian, setVegetarian] = useState(false);
  const [website, setWebsite] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [message, setMessage] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/register/vendor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopType, groceryType: groceryType || null, vegetarian, website: website || null,
        ownerName, email, mobile, bankAccount, bankIfsc
      }),
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Failed'); return; }
    setMessage('Registration submitted. Profile verification takes 24 hrs.');
  }

  return (
    <div className="max-w-2xl mx-auto bg-white border rounded p-6">
      <h1 className="text-xl font-semibold mb-4">Register as Vendor</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block mb-1">Shop Type</label>
          <select className="input" value={shopType} onChange={e=>setShopType(e.target.value as any)}>
            <option value="RESTAURANT_HOTEL">Restaurant/Hotel</option>
            <option value="PUSH_CART">Push Cart</option>
            <option value="GROCERY">Grocery</option>
          </select>
        </div>
        {shopType === 'GROCERY' && (
          <div>
            <label className="block mb-1">Grocery Type</label>
            <select className="input" value={groceryType} onChange={e=>setGroceryType(e.target.value as any)}>
              <option value="">Select</option>
              <option value="SMALL_STORE">Small Store</option>
              <option value="SUPERMARKET">Supermarket</option>
              <option value="HYPERMARKET">Hypermarket</option>
            </select>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input id="veg" type="checkbox" checked={vegetarian} onChange={e=>setVegetarian(e.target.checked)} />
          <label htmlFor="veg">Vegetarian</label>
        </div>
        <input className="input" placeholder="Website (optional)" value={website} onChange={e=>setWebsite(e.target.value)} />
        <input className="input" placeholder="Owner Name" value={ownerName} onChange={e=>setOwnerName(e.target.value)} />
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" placeholder="Mobile Number" value={mobile} onChange={e=>setMobile(e.target.value)} />
        <input className="input" placeholder="Bank Account" value={bankAccount} onChange={e=>setBankAccount(e.target.value)} />
        <input className="input" placeholder="Bank IFSC" value={bankIfsc} onChange={e=>setBankIfsc(e.target.value)} />
        <button className="btn-primary" type="submit">Submit</button>
      </form>
      <p className="mt-4 text-sm">{message}</p>

      <p className="mt-6 text-sm text-gray-600">
        Note: Document uploads will be requested after staff review. Registration fee will be collected based on shop category.
      </p>
    </div>
  );
}