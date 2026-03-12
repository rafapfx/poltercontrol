import { useApp } from '@/contexts/AppContext';
import StatusBadge from './StatusBadge';
import { Polter } from '@/lib/types';
import { MapPin, ChevronRight } from 'lucide-react';

interface Props {
  onSelectPolter: (polter: Polter) => void;
}

const PolterListView = ({ onSelectPolter }: Props) => {
  const { role, getFilteredPolter, getBestand } = useApp();
  const polter = getFilteredPolter();

  if (polter.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <MapPin className="mb-3 h-10 w-10" />
        <p className="text-base">Keine Polter vorhanden</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Card layout */}
      <div className="space-y-2 p-3 sm:hidden">
        {polter.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectPolter(p)}
            className="flex w-full items-center gap-3 rounded-xl border bg-card p-4 text-left shadow-sm transition-all hover:bg-muted/30 active:scale-[0.98] active:bg-muted/50"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground truncate">{p.name}</span>
                <StatusBadge status={p.status} />
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{p.sortiment}</span>
                <span className="font-medium text-foreground">{getBestand(p.id).toFixed(1)} fm</span>
              </div>
              {role === 'transporter' && (
                <p className="mt-0.5 text-xs text-muted-foreground truncate">{p.forstbetrieb}</p>
              )}
              {role === 'forester' && p.transporteurName && (
                <p className="mt-0.5 text-xs text-muted-foreground truncate">↗ {p.transporteurName}</p>
              )}
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/50" />
          </button>
        ))}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {role === 'transporter' && <th className="px-4 py-3 text-left font-medium text-muted-foreground">Forstbetrieb</th>}
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Polter</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Sortiment</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Bestand</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Standort</th>
              {role === 'transporter' && <th className="px-4 py-3 text-left font-medium text-muted-foreground">EUDR-Nr.</th>}
              {role === 'forester' && <th className="px-4 py-3 text-left font-medium text-muted-foreground">Transporteur</th>}
              {role === 'buyer' && <th className="px-4 py-3 text-left font-medium text-muted-foreground">Letzte Bewegung</th>}
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {polter.map((p) => (
              <tr
                key={p.id}
                onClick={() => onSelectPolter(p)}
                className="cursor-pointer border-b transition-colors hover:bg-muted/30"
              >
                {role === 'transporter' && <td className="px-4 py-3 text-foreground">{p.forstbetrieb}</td>}
                <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                <td className="px-4 py-3 text-foreground">{p.sortiment}</td>
                <td className="px-4 py-3 font-medium text-foreground">{getBestand(p.id).toFixed(1)} fm</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {p.lat.toFixed(3)}, {p.lng.toFixed(3)}
                  </span>
                </td>
                {role === 'transporter' && <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.eudrNummer}</td>}
                {role === 'forester' && <td className="px-4 py-3 text-foreground">{p.transporteurName || '—'}</td>}
                {role === 'buyer' && <td className="px-4 py-3 text-muted-foreground text-xs">—</td>}
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PolterListView;
