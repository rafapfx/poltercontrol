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
        <div className="flex justify-center pt-2 pb-0 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 shrink-0">
          <h3 className="text-lg font-semibold text-foreground">{polter.name}</h3>
          <div className="flex items-center gap-1.5">
            {role === 'forester' && (
              <button
                onClick={() => setShowEdit(true)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary active:scale-95"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex border-b shrink-0 px-1">
          <button
            onClick={() => setTab('beschreibung')}
            className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${
              tab === 'beschreibung' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="h-4 w-4" />
            Beschreibung
          </button>
          <button
            onClick={() => setTab('historie')}
            className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${
              tab === 'historie' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="h-4 w-4" />
            Historie
          </button>
        </div>

        <div className="overflow-y-auto flex-1 overscroll-contain">
          {tab === 'beschreibung' ? (
            <div className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sortiment</span>
                <span className="text-sm font-medium text-foreground">{polter.sortiment}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Anfangsvolumen</span>
                <span className="text-sm text-muted-foreground">{polter.volumen} fm</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-primary/10 px-4 py-3">
                <span className="text-sm font-medium text-foreground">Aktueller Bestand</span>
                <span className="text-lg font-bold text-primary">{bestand.toFixed(1)} fm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge status={polter.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">EUDR-Nr.</span>
                <span className="font-mono text-xs text-foreground">{polter.eudrNummer}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{polter.lat.toFixed(5)}, {polter.lng.toFixed(5)}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{polter.beschreibung}</p>
              {polter.transporteurName && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Transporteur</span>
                  <span className="text-sm text-foreground">{polter.transporteurName}</span>
                </div>
              )}
              {polter.kaeuferName && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Käufer</span>
                  <span className="text-sm text-foreground">{polter.kaeuferName}</span>
                </div>
              )}

              {role !== 'buyer' && (
                <div className="flex gap-3 pt-3">
                  <button
                    onClick={() => setBookingType('checkin')}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.97]"
                  >
                    <LogIn className="h-4 w-4" />
                    Einbuchen
                  </button>
                  <button
                    onClick={() => setBookingType('checkout')}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-600 active:scale-[0.97]"
                  >
                    <LogOut className="h-4 w-4" />
                    Ausbuchen
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {bookings.length === 0 && (
                <p className="p-6 text-center text-sm text-muted-foreground">Keine Buchungen vorhanden</p>
              )}
              {bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between px-5 py-3.5">
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
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {format(new Date(b.erstelltAm), 'dd.MM.yyyy HH:mm', { locale: de })} · {b.erstelltVon}
                    </p>
                  </div>
                  <span className={`text-sm font-bold ${b.typ === 'checkin' ? 'text-primary' : 'text-amber-600'}`}>
                    {b.typ === 'checkin' ? '+' : '-'}{b.menge} fm
                  </span>
                </div>
              ))}
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
