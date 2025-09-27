'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

type Order = {
  id: number;
  total: string;
  vendor: { shop?: { lat: number; lng: number } | null; user?: { lat?: number | null; lng?: number | null } | null };
};

type Props = {
  orders: Order[];
};

export default function PartnerMap({ orders }: Props) {
  const [center, setCenter] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => setCenter([pos.coords.latitude, pos.coords.longitude]),
      () => setCenter([12.9716, 77.5946]),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  if (!center) return <div className="w-full h-80 border rounded flex items-center justify-center text-sm">Loading map...</div>;

  function orderLatLng(o: Order): [number, number] | null {
    const shop = o.vendor.shop;
    const user = o.vendor.user;
    const lat = shop?.lat ?? user?.lat ?? null;
    const lng = shop?.lng ?? user?.lng ?? null;
    if (lat == null || lng == null) return null;
    return [lat, lng];
  }

  return (
    <div className="w-full h-80">
      {/* @ts-ignore */}
      <MapContainer center={center} zoom={13} scrollWheelZoom={true} className="w-full h-full rounded border">
        {/* @ts-ignore */}
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* @ts-ignore */}
        <Marker position={center}>
          {/* @ts-ignore */}
          <Popup>Your location</Popup>
        </Marker>
        {orders.map(o => {
          const pos = orderLatLng(o);
          if (!pos) return null;
          return (
            // @ts-ignore
            <Marker key={o.id} position={pos}>
              {/* @ts-ignore */}
              <Popup>
                Order #{o.id}<br />
                Total: ₹{o.total}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}