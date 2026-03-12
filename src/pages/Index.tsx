import { useState } from 'react';
import { List, Map, Plus } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import PolterListView from '@/components/PolterListView';
import PolterMapView from '@/components/PolterMapView';
import PolterDetailCard from '@/components/PolterDetailCard';
import BookingModal from '@/components/BookingModal';
import CreatePolterDialog from '@/components/CreatePolterDialog';
import { useApp } from '@/contexts/AppContext';
import { Polter } from '@/lib/types';

type ViewMode = 'liste' | 'karte';

const Index = () => {
  const [view, setView] = useState<ViewMode>('liste');
  const [selectedPolter, setSelectedPolter] = useState<Polter | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const { role } = useApp();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />

      <div className="flex items-center justify-between border-b bg-card px-4 py-3">
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          <button
            onClick={() => setView('liste')}
            className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              view === 'liste' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="h-4 w-4" />
            Liste
          </button>
          <button
            onClick={() => setView('karte')}
            className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              view === 'karte' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Map className="h-4 w-4" />
            Karte
          </button>
        </div>

        {role === 'forester' && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Neuer Polter</span>
          </button>
        )}
      </div>

      <main className="flex-1">
        {view === 'liste' ? (
          <div className="bg-card">
            <PolterListView onSelectPolter={setSelectedPolter} />
          </div>
        ) : (
          <PolterMapView />
        )}
      </main>

      {selectedPolter && view === 'liste' && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/50" onClick={() => setSelectedPolter(null)}>
          <div onClick={e => e.stopPropagation()} className="relative">
            <PolterDetailCard polter={selectedPolter} onClose={() => setSelectedPolter(null)} />
          </div>
        </div>
      )}

      <CreatePolterDialog open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
};

export default Index;
