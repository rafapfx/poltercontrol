import { useApp } from '@/contexts/AppContext';
import StatusBadge from './StatusBadge';
import { Polter } from '@/lib/types';
import { MapPin } from 'lucide-react';

interface Props {
  onSelectPolter: (polter: Polter) => void;
}

const PolterListView = ({ onSelectPolter }: Props) => {
  const { role, getFilteredPolter } = useApp();
  const polter = getFilteredPolter();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {role === 'transporter' && <th className="px-4 py-3 text-left font-medium text-muted-foreground">Forstbetrieb</th>}
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Polter</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Sortiment</th>
            {role === 'forester' && <th className="px-4 py-3 text-left font-medium text-muted-foreground">Volumen</th>}
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
              {role === 'forester' && <td className="px-4 py-3 text-foreground">{p.volumen} fm</td>}
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
      {polter.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <MapPin className="mb-2 h-8 w-8" />
          <p>Keine Polter vorhanden</p>
        </div>
      )}
    </div>
  );
};

export default PolterListView;
