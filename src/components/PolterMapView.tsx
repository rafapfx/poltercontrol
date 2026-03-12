import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed } from 'lucide-react';
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

const PolterMapView = () => {
  const { getFilteredPolter } = useApp();
  const polter = getFilteredPolter();
  const [selected, setSelected] = useState<Polter | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center: [number, number] = polter.length > 0
      ? [polter[0].lat, polter[0].lng]
      : [48.135, 11.58];

    mapRef.current = L.map(containerRef.current).setView(center, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add new markers
    polter.forEach((p) => {
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 12,
        fillColor: statusColors[p.status],
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 1,
      }).addTo(mapRef.current!);

      marker.on('click', () => setSelected(p));
      
      marker.bindTooltip(p.name, {
        direction: 'top',
        offset: [0, -12],
      });

      markersRef.current.push(marker);
    });

    // Fit bounds
    if (polter.length > 0) {
      const bounds = L.latLngBounds(polter.map(p => [p.lat, p.lng] as [number, number]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [polter]);

  const handleLocate = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapRef.current?.setView([latitude, longitude], 15);
        // Show a pulsing marker at user location
        L.circleMarker([latitude, longitude], {
          radius: 8, fillColor: '#3b82f6', color: '#ffffff', weight: 3, opacity: 1, fillOpacity: 1,
        }).addTo(mapRef.current!).bindTooltip('Mein Standort', { direction: 'top', offset: [0, -10] }).openTooltip();
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="h-full w-full"
        style={{ minHeight: 'calc(100vh - 7.5rem)' }}
      />

      <button
        onClick={handleLocate}
        className="absolute bottom-6 left-4 z-[1000] flex items-center gap-1.5 rounded-lg bg-card px-3 py-2 text-sm font-medium text-foreground shadow-lg border transition-colors hover:bg-muted"
      >
        <LocateFixed className="h-4 w-4 text-primary" />
        Mein Standort
      </button>

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
