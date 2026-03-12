import { useState } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { sortimentOptions } from '@/lib/mock-data';
import { Polter, PolterStatus } from '@/lib/types';

const statusOptions: PolterStatus[] = ['Neu', 'Bereit', 'Transport zugewiesen', 'Abgeholt', 'Geliefert'];

interface Props {
  polter: Polter;
  onClose: () => void;
  onDeleted: () => void;
}

const EditPolterModal = ({ polter, onClose, onDeleted }: Props) => {
  const { updatePolter, deletePolter, transporteure, kaeufer } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: polter.name,
    sortiment: polter.sortiment,
    volumen: String(polter.volumen),
    beschreibung: polter.beschreibung,
    status: polter.status,
    eudrNummer: polter.eudrNummer,
    transporteurId: polter.transporteurId || '',
    kaeuferId: polter.kaeuferId || '',
  });

  const handleSave = async () => {
    if (!form.name) {
      toast.error('Name darf nicht leer sein');
      return;
    }
    setSaving(true);
    const t = transporteure.find(t => t.id === form.transporteurId);
    const k = kaeufer.find(k => k.id === form.kaeuferId);
    await updatePolter({
      ...polter,
      name: form.name,
      sortiment: form.sortiment,
      volumen: parseFloat(form.volumen) || polter.volumen,
      beschreibung: form.beschreibung,
      status: form.status,
      eudrNummer: form.eudrNummer,
      transporteurId: form.transporteurId || null,
      transporteurName: t?.name || null,
      kaeuferId: form.kaeuferId || null,
      kaeuferName: k?.name || null,
    });
    setSaving(false);
    toast.success('Polter aktualisiert');
    onClose();
  };

  const handleDelete = async () => {
    await deletePolter(polter.id);
    onDeleted();
  };

  const inputClass = "h-12 w-full rounded-xl border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow";
  const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

  return (
    <div className="fixed inset-0 z-[2500] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-lg rounded-t-2xl bg-card sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-center pt-2 pb-0 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 shrink-0">
          <h2 className="text-lg font-semibold text-foreground">Polter bearbeiten</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 overscroll-contain space-y-4 px-5 pb-2">
          <div>
            <label className={labelClass}>Name</label>
            <input className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Sortiment</label>
              <select className={inputClass} value={form.sortiment} onChange={e => setForm({ ...form, sortiment: e.target.value })}>
                {sortimentOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select className={inputClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as PolterStatus })}>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Beschreibung</label>
            <textarea
              className="w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              rows={2}
              value={form.beschreibung}
              onChange={e => setForm({ ...form, beschreibung: e.target.value })}
            />
          </div>

          <div>
            <label className={labelClass}>EUDR-Nummer</label>
            <input className={inputClass} value={form.eudrNummer} onChange={e => setForm({ ...form, eudrNummer: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Transporteur</label>
              <select className={inputClass} value={form.transporteurId} onChange={e => setForm({ ...form, transporteurId: e.target.value })}>
                <option value="">— Keiner —</option>
                {transporteure.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Käufer</label>
              <select className={inputClass} value={form.kaeuferId} onChange={e => setForm({ ...form, kaeuferId: e.target.value })}>
                <option value="">— Keiner —</option>
                {kaeufer.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t px-5 py-4 shrink-0">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10 active:scale-95"
            >
              <Trash2 className="h-4 w-4" />
              Löschen
            </button>
          ) : (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground shadow-sm transition-all hover:bg-destructive/90 active:scale-95"
            >
              <Trash2 className="h-4 w-4" />
              Wirklich löschen?
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted active:scale-95"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPolterModal;
