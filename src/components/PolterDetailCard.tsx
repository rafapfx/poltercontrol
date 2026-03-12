import { useState } from 'react';
import { X, LogIn, LogOut, MapPin, FileText, Clock, Pencil } from 'lucide-react';
import { Polter } from '@/lib/types';
import { useApp } from '@/contexts/AppContext';
import StatusBadge from './StatusBadge';
import BookingModal from './BookingModal';
import EditPolterModal from './EditPolterModal';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Props {
  polter: Polter;
  onClose: () => void;
}

const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-[13px] text-muted-foreground">{label}</span>
    <span className="text-[13px] font-medium text-foreground text-right ml-4">{children}</span>
  </div>
);

const PolterDetailCard = ({ polter, onClose }: Props) => {
  const [tab, setTab] = useState<'beschreibung' | 'historie'>('beschreibung');
  const [bookingType, setBookingType] = useState<'checkin' | 'checkout' | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const { getBookingsForPolter, getBestand, role } = useApp();
  const bookings = getBookingsForPolter(polter.id);
  const bestand = getBestand(polter.id);

  const handleBookingDone = () => {
    setBookingType(null);
    setTab('historie');
  };

  return (
    <>
      <div className="w-full max-w-md overflow-hidden rounded-t-2xl sm:rounded-2xl border bg-card shadow-2xl max-h-[85vh] flex flex-col">
        {/* Drag indicator */}
        <div className="flex justify-center pt-2.5 pb-0 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/25" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 shrink-0">
          <h3 className="text-lg font-bold text-foreground tracking-tight">{polter.name}</h3>
          <div className="flex items-center gap-2">
            {role === 'forester' && (
              <button
                onClick={() => setShowEdit(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary active:scale-95"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 mx-5 rounded-xl bg-muted p-1">
          <button
            onClick={() => setTab('beschreibung')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-[13px] font-medium transition-all ${
              tab === 'beschreibung' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Beschreibung
          </button>
          <button
            onClick={() => setTab('historie')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-[13px] font-medium transition-all ${
              tab === 'historie' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Historie
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          {tab === 'beschreibung' ? (
            <div className="px-5 py-4">
              {/* Bestand highlight */}
              <div className="flex items-center justify-between rounded-2xl bg-primary/8 px-5 py-4 mb-4">
                <span className="text-sm font-medium text-foreground">Aktueller Bestand</span>
                <span className="text-xl font-bold text-primary tabular-nums">{bestand.toFixed(1)} fm</span>
              </div>

              {/* Details grid */}
              <div className="divide-y divide-border/60">
                <DetailRow label="Sortiment">{polter.sortiment}</DetailRow>
                <DetailRow label="Anfangsvolumen">{polter.volumen} fm</DetailRow>
                <DetailRow label="Status"><StatusBadge status={polter.status} /></DetailRow>
                <DetailRow label="EUDR-Nr.">
                  <span className="font-mono text-xs">{polter.eudrNummer}</span>
                </DetailRow>
                <div className="flex items-center gap-2 py-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[13px] text-muted-foreground tabular-nums">
                    {polter.lat.toFixed(5)}, {polter.lng.toFixed(5)}
                  </span>
                </div>
                {polter.beschreibung && (
                  <div className="py-3">
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{polter.beschreibung}</p>
                  </div>
                )}
                {polter.transporteurName && (
                  <DetailRow label="Transporteur">{polter.transporteurName}</DetailRow>
                )}
                {polter.kaeuferName && (
                  <DetailRow label="Käufer">{polter.kaeuferName}</DetailRow>
                )}
              </div>

              {/* Action buttons */}
              {role !== 'buyer' && (
                <div className="flex gap-3 pt-5">
                  <button
                    onClick={() => setBookingType('checkin')}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.97]"
                  >
                    <LogIn className="h-4 w-4" />
                    Einbuchen
                  </button>
                  <button
                    onClick={() => setBookingType('checkout')}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-600 active:scale-[0.97]"
                  >
                    <LogOut className="h-4 w-4" />
                    Ausbuchen
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="px-5 py-3">
              {bookings.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">Keine Buchungen vorhanden</p>
              )}
              <div className="space-y-2">
                {bookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        {b.typ === 'checkin' ? (
                          <LogIn className="h-4 w-4 text-primary" />
                        ) : (
                          <LogOut className="h-4 w-4 text-amber-500" />
                        )}
                        <span className="text-sm font-medium text-foreground">
                          {b.typ === 'checkin' ? 'Einbuchung' : 'Ausbuchung'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {format(new Date(b.erstelltAm), 'dd.MM.yyyy HH:mm', { locale: de })} · {b.erstelltVon}
                      </p>
                    </div>
                    <span className={`text-base font-bold tabular-nums ${b.typ === 'checkin' ? 'text-primary' : 'text-amber-600'}`}>
                      {b.typ === 'checkin' ? '+' : '-'}{b.menge} fm
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {bookingType && (
        <BookingModal
          polter={polter}
          defaultType={bookingType}
          onClose={handleBookingDone}
        />
      )}

      {showEdit && (
        <EditPolterModal
          polter={polter}
          onClose={() => setShowEdit(false)}
          onDeleted={onClose}
        />
      )}
    </>
  );
};

export default PolterDetailCard;
