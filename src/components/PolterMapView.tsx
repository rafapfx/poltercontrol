import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '@/contexts/AppContext';
import { Polter, PolterStatus } from '@/lib/types';
import PolterDetailCard from './PolterDetailCard';

const statusColors: Record<PolterStatus, string> = {
  'Neu': '#9ca3af',
  'Bereit': '#10b981',
  'Transport zugewiesen': '#3b82f6',
  'Abgeholt': '#f59e0b',
  'Geliefert': '#2D6A4F',
};

const createIcon = (status: PolterStatus) => {
  const color = statusColors[status];
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

function FitBounds({ polter }: { polter: Polter[] }) {
  const map = useMap();
  useEffect(() => {
    if (polter.length > 0) {
      const bounds = L.latLngBounds(polter.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [polter, map]);
  return null;
}

interface Props {
  onSelectPolter?: (polter: Polter) => void;
}

const PolterMapView = ({ onSelectPolter }: Props) => {
  const { getFilteredPolter } = useApp();
  const polter = getFilteredPolter();
  const [selected, setSelected] = useState<Polter | null>(null);

  const center: [number, number] = polter.length > 0
    ? [polter[0].lat, polter[0].lng]
    : [48.135, 11.58];

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full"
        style={{ minHeight: 'calc(100vh - 7.5rem)' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds polter={polter} />
        {polter.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={createIcon(p.status)}
            eventHandlers={{
              click: () => setSelected(p),
            }}
          />
        ))}
      </MapContainer>

      {selected && (
        <PolterDetailCard
          polter={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

export default PolterMapView;
