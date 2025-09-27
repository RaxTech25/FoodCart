'use client';
import { useEffect, useState } from 'react';

type Product = {
  id: number;
  name: string;
  price: string;
  commissionRate: number;
  vendorId: number;
  imageUrl?: string;
  description?: string;
};

type CartItem = {
  product: Product;
  quantity: number;
  cutlery: boolean;
};

export default function CustomerBrowsePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState('Home Address Details');
  const [message, setMessage] = useState('');

  async function load() {
    const res = await fetch('/api/customer/products');
    const data = await res.json();
    if (res.ok) setProducts(data.products || []);
  }

  useEffect(() => { load(); }, []);

  function addToCart(p: Product) {
    setCart(prev => {
      const idx = prev.findIndex(ci => ci.product.id === p.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].quantity += 1;
        return copy;
      }
      return [...prev, { product: p, quantity: 1, cutlery: false }];
    });
  }

  function toggleCutlery(pid: number) {
    setCart(prev => prev.map(ci => ci.product.id === pid ? { ...ci, cutlery: !ci.cutlery } : ci));
  }

  async function checkout() {
    setMessage('');
    const items = cart.map(ci => ({
      productId: ci.product.id,
      quantity: ci.quantity,
      cutlery: ci.cutlery,
    }));
    const res = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, address }),
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Checkout failed'); return; }
    setMessage(`Order ${data.orderId} placed. Awaiting vendor acceptance.`);
    setCart([]);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Browse Items</h1>
      <p className="text-sm text-gray-600">Enable location in your browser for better recommendations.</p>

      <div className="grid grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-white border rounded p-4">
            {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-full h-32 object-cover rounded" />}
            <div className="font-medium mt-2">{p.name}</div>
            <div className="text-sm text-gray-600">₹{p.price}</div>
            <p className="text-xs mt-2">{p.description}</p>
            <button className="btn-outline mt-3" onClick={() => addToCart(p)}>Add</button>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded p-4">
        <h2 className="font-medium mb-2">Cart</h2>
        {cart.length === 0 && <p className="text-sm">No items in cart.</p>}
        {cart.map(ci => (
          <div key={ci.product.id} className="flex items-center justify-between border-t py-2">
            <div>
              <div className="text-sm">{ci.product.name} × {ci.quantity}</div>
              <div className="text-xs text-gray-600">₹{ci.product.price}</div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs">Cutlery</label>
              <input type="checkbox" checked={ci.cutlery} onChange={() => toggleCutlery(ci.product.id)} />
            </div>
          </div>
        ))}
        <input className="input mt-3" placeholder="Delivery address" value={address} onChange={e=>setAddress(e.target.value)} />
        <button className="btn-primary mt-3" onClick={checkout} disabled={cart.length===0}>Proceed to Pay (Simulated)</button>
        <p className="text-sm mt-2">{message}</p>
      </div>
    </div>
  );
}