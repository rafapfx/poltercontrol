import { TreePine, Truck, ShoppingCart } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { UserRole } from '@/lib/types';

const roles: { value: UserRole; label: string; icon: React.ReactNode }[] = [
  { value: 'forester', label: 'Förster', icon: <TreePine className="h-4 w-4" /> },
  { value: 'transporter', label: 'Transporteur', icon: <Truck className="h-4 w-4" /> },
  { value: 'buyer', label: 'Käufer', icon: <ShoppingCart className="h-4 w-4" /> },
];

const AppHeader = () => {
  const { role, setRole } = useApp();

  return (
    <header className="sticky top-0 z-50 border-b bg-card shadow-sm">
      <div className="flex h-14 items-center justify-between px-3 sm:px-4">
        <div className="flex items-center gap-2">
          <TreePine className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span className="text-base sm:text-lg font-bold tracking-tight text-foreground">
            Forst<span className="text-primary">Control</span>
          </span>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1 rounded-lg bg-muted p-0.5 sm:p-1">
          {roles.map((r) => (
            <button
              key={r.value}
              onClick={() => setRole(r.value)}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-md px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-all ${
                role === r.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r.icon}
              <span className="hidden xs:inline sm:inline">{r.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
