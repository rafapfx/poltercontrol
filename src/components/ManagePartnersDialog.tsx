import { useState } from 'react';
import { X, Plus, Truck, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ManagePartnersDialog = ({ open, onClose }: Props) => {
  const { transporteure, kaeufer, addTransporteur, addKaeufer } = useApp();
  const [tab, setTab] = useState<'transporteure' | 'kaeufer'>('transporteure');
  const [newName, setNewName] = useState('');

  if (!open) return null;

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) {
      toast.error('Bitte einen Namen eingeben');
      return;
    }
    if (tab === 'transporteure') {
      addTransporteur(name);
      toast.success(`Transporteur "${name}" hinzugefügt`);
    } else {
      addKaeufer(name);
      toast.success(`Käufer "${name}" hinzugefügt`);
    }
    setNewName('');
  };

  const list = tab === 'transporteure' ? transporteure : kaeufer;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-card shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold text-foreground">Partner verwalten</h2>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => { setTab('transporteure'); setNewName(''); }}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
              tab === 'transporteure' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Truck className="h-3.5 w-3.5" />
            Transporteure
          </button>
          <button
            onClick={() => { setTab('kaeufer'); setNewName(''); }}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
              tab === 'kaeufer' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Käufer
          </button>
        </div>

        <div className="p-5">
          <div className="flex gap-2">
            <input
              className="h-10 flex-1 rounded-lg border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder={tab === 'transporteure' ? 'Neuer Transporteur...' : 'Neuer Käufer...'}
            />
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Hinzufügen
            </button>
          </div>

          <div className="mt-4 max-h-60 divide-y overflow-y-auto rounded-lg border">
            {list.length === 0 && (
              <p className="p-4 text-center text-sm text-muted-foreground">Keine Einträge vorhanden</p>
            )}
            {list.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                {tab === 'transporteure' ? (
                  <Truck className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium text-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end border-t px-5 py-4">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
            Schliessen
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagePartnersDialog;
