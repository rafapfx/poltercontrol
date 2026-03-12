import { useState } from 'react';
import { List, Map, Plus, Users } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import PolterListView from '@/components/PolterListView';
import PolterMapView from '@/components/PolterMapView';
import PolterDetailCard from '@/components/PolterDetailCard';
import CreatePolterDialog from '@/components/CreatePolterDialog';
import ManagePartnersDialog from '@/components/ManagePartnersDialog';
import { useApp } from '@/contexts/AppContext';

type ViewMode = 'liste' | 'karte';

const Index = () => {
  const [view, setView] = useState<ViewMode>('liste');
  const [selectedPolterId, setSelectedPolterId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showPartners, setShowPartners] = useState(false);
  const { role, getPolterById } = useApp();

  const selectedPolter = selectedPolterId ? getPolterById(selectedPolterId) : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-background touch-pan-y">
      <AppHeader />

      <div className="flex items-center justify-between border-b bg-card px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex items-center gap-0.5 rounded-xl bg-muted p-1">
          <button
            onClick={() => setView('liste')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 sm:px-4 py-2 text-sm font-medium transition-all ${
              view === 'liste' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="h-4 w-4" />
            Liste
          </button>
          <button
            onClick={() => setView('karte')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 sm:px-4 py-2 text-sm font-medium transition-all ${
              view === 'karte' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Map className="h-4 w-4" />
            Karte
          </button>
        </div>

        {role === 'forester' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPartners(true)}
              className="flex h-10 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted active:scale-95"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Partner</span>
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Neuer Polter</span>
            </button>
          </div>
        )}
      </div>

      <main className="flex-1">
        {view === 'liste' ? (
          <div className="bg-card">
            <PolterListView onSelectPolter={(p) => setSelectedPolterId(p.id)} />
          </div>
        ) : (
          <PolterMapView />
        )}
      </main>

      {selectedPolter && view === 'liste' && (
        <div
          className="fixed inset-0 z-[1500] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedPolterId(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full sm:w-auto animate-in slide-in-from-bottom duration-300 sm:animate-in sm:fade-in sm:zoom-in-95"
          >
            <PolterDetailCard polter={selectedPolter} onClose={() => setSelectedPolterId(null)} />
          </div>
        </div>
      )}

      <CreatePolterDialog open={showCreate} onClose={() => setShowCreate(false)} />
      <ManagePartnersDialog open={showPartners} onClose={() => setShowPartners(false)} />
    </div>
  );
};

export default Index;
