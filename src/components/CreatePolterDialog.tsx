import { useState } from 'react';
import { X, Plus, LocateFixed, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { sortimentOptions } from '@/lib/mock-data';
import { Polter } from '@/lib/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CreatePolterDialog = ({ open, onClose }: Props) => {
  const { addPolter, transporteure, kaeufer } = useApp();
  const [locating, setLocating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    sortiment: sortimentOptions[0],
    volumen: '',
    beschreibung: '',
    lat: '47.39',
    lng: '8.18',
    eudrNummer: '',
    transporteurId: '',
    kaeuferId: '',
  });

  if (!open) return null;

  const handleSubmit = async () => {
    if (!form.name || !form.volumen) {
      toast.error('Bitte Name und Volumen eingeben');
      return;
    }
    const t = transporteure.find(t => t.id === form.transporteurId);
    const k = kaeufer.find(k => k.id === form.kaeuferId);
    await addPolter({
      name: form.name,
      sortiment: form.sortiment,
      volumen: parseFloat(form.volumen),
      beschreibung: form.beschreibung,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      eudrNummer: form.eudrNummer || `EUDR-${Date.now()}`,
      status: form.transporteurId ? 'Transport zugewiesen' : 'Neu',
      forstbetrieb: 'Forstbetrieb Wettingen',
      transporteurId: form.transporteurId || null,
      transporteurName: t?.name || null,
      kaeuferId: form.kaeuferId || null,
      kaeuferName: k?.name || null,
      erstelltAm: new Date().toISOString(),
    });
    toast.success('Polter erstellt');
    onClose();
  };

  const inputClass = "h-10 w-full rounded-lg border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
  const labelClass = "mb-1 block text-sm font-medium text-foreground";

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-2xl bg-card shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold text-foreground">Neuen Polter anlegen</h2>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto space-y-4 p-5">
          <div>
            <label className={labelClass}>Polter-Name *</label>
            <input className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="z.B. Polter Heitersberg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Sortiment</label>
              <select className={inputClass} value={form.sortiment} onChange={e => setForm({ ...form, sortiment: e.target.value })}>
                {sortimentOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Volumen (fm) *</label>
              <input className={inputClass} type="number" step="0.1" value={form.volumen} onChange={e => setForm({ ...form, volumen: e.target.value })} placeholder="z.B. 85.4" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Beschreibung</label>
            <textarea className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" rows={2} value={form.beschreibung} onChange={e => setForm({ ...form, beschreibung: e.target.value })} placeholder="Beschreibung..." />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Standort</label>
              <button
                type="button"
                onClick={() => {
                  if (!navigator.geolocation) {
                    toast.error('Geolocation wird von diesem Browser nicht unterstützt');
                    return;
                  }
                  setLocating(true);
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      setForm(f => ({ ...f, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }));
                      setLocating(false);
                      toast.success('Standort ermittelt');
                    },
                    () => {
                      setLocating(false);
                      toast.error('Standort konnte nicht ermittelt werden');
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                  );
                }}
                className="flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              >
                {locating ? <Loader2 className="h-3 w-3 animate-spin" /> : <LocateFixed className="h-3 w-3" />}
                Mein Standort
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input className={inputClass} type="number" step="0.0001" placeholder="Breitengrad" value={form.lat} onChange={e => setForm({ ...form, lat: e.target.value })} />
              <input className={inputClass} type="number" step="0.0001" placeholder="Längengrad" value={form.lng} onChange={e => setForm({ ...form, lng: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={labelClass}>EUDR-Nummer</label>
            <input className={inputClass} value={form.eudrNummer} onChange={e => setForm({ ...form, eudrNummer: e.target.value })} placeholder="EUDR-2026-..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Transporteur zuweisen</label>
              <select className={inputClass} value={form.transporteurId} onChange={e => setForm({ ...form, transporteurId: e.target.value })}>
                <option value="">— Keiner —</option>
                {transporteure.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Käufer zuweisen</label>
              <select className={inputClass} value={form.kaeuferId} onChange={e => setForm({ ...form, kaeuferId: e.target.value })}>
                <option value="">— Keiner —</option>
                {kaeufer.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t px-5 py-4">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">Abbrechen</button>
          <button onClick={handleSubmit} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Polter erstellen
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePolterDialog;
