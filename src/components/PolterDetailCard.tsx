import { useState } from 'react';
import { X, LogIn, LogOut, MapPin, FileText, Clock } from 'lucide-react';
import { Polter } from '@/lib/types';
import { useApp } from '@/contexts/AppContext';
import StatusBadge from './StatusBadge';
import BookingModal from './BookingModal';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Props {
  polter: Polter;
  onClose: () => void;
}

const PolterDetailCard = ({ polter, onClose }: Props) => {
  const [tab, setTab] = useState<'beschreibung' | 'historie'>('beschreibung');
  const [bookingType, setBookingType] = useState<'checkin' | 'checkout' | null>(null);
  const { getBookingsForPolter, role } = useApp();
  const bookings = getBookingsForPolter(polter.id);

  return (
    <>
      <div className="absolute right-4 top-4 z-[1000] w-80 overflow-hidden rounded-xl border bg-card shadow-lg sm:w-96">
        <div className="flex items-center justify-between border-b bg-primary/5 px-4 py-3">
          <h3 className="font-semibold text-foreground">{polter.name}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setTab('beschreibung')}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
              tab === 'beschreibung' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Beschreibung
          </button>
          <button
            onClick={() => setTab('historie')}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
              tab === 'historie' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Historie
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {tab === 'beschreibung' ? (
            <div className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sortiment</span>
                <span className="text-sm font-medium text-foreground">{polter.sortiment}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Volumen</span>
                <span className="text-sm font-medium text-foreground">{polter.volumen} fm</span>
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
                <MapPin className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{polter.lat.toFixed(5)}, {polter.lng.toFixed(5)}</span>
              </div>
              <p className="text-sm text-muted-foreground">{polter.beschreibung}</p>
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
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setBookingType('checkin')}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <LogIn className="h-4 w-4" />
                    Einbuchen
                  </button>
                  <button
                    onClick={() => setBookingType('checkout')}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-600"
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
                <p className="p-4 text-center text-sm text-muted-foreground">Keine Buchungen vorhanden</p>
              )}
              {bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {b.typ === 'checkin' ? (
                        <LogIn className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <LogOut className="h-3.5 w-3.5 text-amber-500" />
                      )}
                      <span className="text-sm font-medium text-foreground">
                        {b.typ === 'checkin' ? 'Einbuchen' : 'Ausbuchen'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {format(new Date(b.erstelltAm), 'dd.MM.yyyy HH:mm', { locale: de })} · {b.erstelltVon}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold ${b.typ === 'checkin' ? 'text-primary' : 'text-amber-600'}`}>
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
          onClose={() => setBookingType(null)}
        />
      )}
    </>
  );
};

export default PolterDetailCard;
