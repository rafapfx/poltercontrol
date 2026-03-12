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

const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="mb-2 block text-[13px] font-medium text-muted-foreground">{label}</label>
    {children}
  </div>
);

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

  const inputClass = "h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none";
  const selectClass = `${inputClass} cursor-pointer`;

  return (
    <div className="fixed inset-0 z-[2500] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-2xl bg-card sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Drag indicator */}
        <div className="flex justify-center pt-2.5 pb-0 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/25" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0">
          <h2 className="text-lg font-bold text-foreground tracking-tight">Polter bearbeiten</h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto flex-1 overscroll-contain px-6 pb-4 space-y-5">
          <FormField label="Name">
            <input className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Polter-Name" />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Sortiment">
              <select className={selectClass} value={form.sortiment} onChange={e => setForm({ ...form, sortiment: e.target.value })}>
                {sortimentOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Status">
              <select className={selectClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as PolterStatus })}>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
          </div>

          <FormField label="Beschreibung">
            <textarea
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
              rows={3}
              value={form.beschreibung}
              onChange={e => setForm({ ...form, beschreibung: e.target.value })}
              placeholder="Beschreibung des Polters..."
            />
          </FormField>

          <FormField label="EUDR-Nummer">
            <input className={inputClass} value={form.eudrNummer} onChange={e => setForm({ ...form, eudrNummer: e.target.value })} placeholder="EUDR-2026-..." />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Transporteur">
              <select className={selectClass} value={form.transporteurId} onChange={e => setForm({ ...form, transporteurId: e.target.value })}>
                <option value="">— Keiner —</option>
                {transporteure.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </FormField>
            <FormField label="Käufer">
              <select className={selectClass} value={form.kaeuferId} onChange={e => setForm({ ...form, kaeuferId: e.target.value })}>
                <option value="">— Keiner —</option>
                {kaeufer.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
            </FormField>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-6 py-4 shrink-0 gap-3">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10 active:scale-95"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Löschen</span>
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
              className="rounded-xl border px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted active:scale-95 hidden sm:block"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
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
