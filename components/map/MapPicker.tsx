'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const useMapEvents = dynamic(() => import('react-leaflet').then(m => m.useMapEvents), { ssr: false });

type Props = {
  lat?: number | null;
  lng?: number | null;
  onChange?: (lat: number, lng: number) => void;
};

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  // @ts-ignore
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({ lat, lng, onChange }: Props) {
  const [center, setCenter] = useState<[number, number]>([lat ?? 12.9716, lng ?? 77.5946]); // default Bangalore
  const [marker, setMarker] = useState<[number, number] | null>(lat != null && lng != null ? [lat!, lng!] : null);

  useEffect(() => {
    if (lat != null && lng != null) {
      setCenter([lat!, lng!]);
      setMarker([lat!, lng!]);
    }
  }, [lat, lng]);

  function handleClick(newLat: number, newLng: number) {
    setMarker([newLat, newLng]);
    onChange?.(newLat, newLng);
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
        <ClickHandler onClick={handleClick} />
        {marker && (
          // @ts-ignore
          <Marker position={marker} />
        )}
      </MapContainer>
    </div>
  );
}