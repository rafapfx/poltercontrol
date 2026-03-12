import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { PolterStatus } from '@/lib/types';
import PolterDetailCard from './PolterDetailCard';

const statusColors: Record<PolterStatus, string> = {
  'Neu': '#9ca3af',
  'Bereit': '#10b981',
  'Transport zugewiesen': '#3b82f6',
  'Abgeholt': '#f59e0b',
  'Geliefert': '#2D6A4F',
};

const PolterMapView = () => {
  const { getFilteredPolter, getPolterById } = useApp();
  const polter = getFilteredPolter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  const selected = selectedId ? getPolterById(selectedId) : undefined;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center: [number, number] = polter.length > 0
      ? [polter[0].lat, polter[0].lng]
      : [47.39, 8.05];

    mapRef.current = L.map(containerRef.current, {
      zoomControl: false,
    }).setView(center, 13);

    // Add zoom control top-right
    L.control.zoom({ position: 'topright' }).addTo(mapRef.current);

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

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    polter.forEach((p) => {
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 12,
        fillColor: statusColors[p.status],
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 1,
      }).addTo(mapRef.current!);

      marker.on('click', () => setSelectedId(p.id));
      
      marker.bindTooltip(p.name, {
        direction: 'top',
        offset: [0, -12],
      });

      markersRef.current.push(marker);
    });

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
        L.circleMarker([latitude, longitude], {
          radius: 8, fillColor: '#3b82f6', color: '#ffffff', weight: 3, opacity: 1, fillOpacity: 1,
        }).addTo(mapRef.current!).bindTooltip('Mein Standort', { direction: 'top', offset: [0, -10] }).openTooltip();
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative h-full w-full touch-auto">
      <div
        ref={containerRef}
        className="h-full w-full touch-auto"
        style={{ minHeight: 'calc(100vh - 7.5rem)' }}
      />

      <button
        onClick={handleLocate}
        className="absolute bottom-6 left-4 z-[1000] flex h-12 items-center gap-2 rounded-xl bg-card px-4 text-sm font-medium text-foreground shadow-lg border transition-colors hover:bg-muted active:scale-95"
      >
        <LocateFixed className="h-5 w-5 text-primary" />
        <span className="hidden sm:inline">Mein Standort</span>
      </button>

      {selected && (
        <div
          className="fixed inset-0 z-[1500] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedId(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full sm:w-auto animate-in slide-in-from-bottom duration-300 sm:animate-in sm:fade-in sm:zoom-in-95"
          >
            <PolterDetailCard
              polter={selected}
              onClose={() => setSelectedId(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PolterMapView;
