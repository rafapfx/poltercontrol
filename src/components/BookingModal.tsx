import { useState } from 'react';
import { X, LogIn, LogOut, Camera, Check } from 'lucide-react';
import { Polter, BookingType } from '@/lib/types';
import { useApp } from '@/contexts/AppContext';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

interface Props {
  polter: Polter;
  defaultType: BookingType;
  onClose: () => void;
}

const BookingModal = ({ polter, defaultType, onClose }: Props) => {
  const [typ, setTyp] = useState<BookingType>(defaultType);
  const [menge, setMenge] = useState('');
  const { addBooking, getBookingsForPolter } = useApp();
  const recentBookings = getBookingsForPolter(polter.id).slice(0, 3);

  const handleSubmit = () => {
    const val = parseFloat(menge);
    if (!val || val <= 0) {
      toast.error('Bitte gültige Menge eingeben');
      return;
    }
    addBooking(polter.id, typ, val);
    toast.success(`${typ === 'checkin' ? 'Einbuchung' : 'Ausbuchung'} erfolgreich: ${val} fm`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-card sm:rounded-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold text-foreground">Buchung</h2>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="rounded-lg bg-muted/50 px-4 py-3">
            <p className="text-sm text-muted-foreground">Polter</p>
            <p className="font-medium text-foreground">{polter.name}</p>
            <p className="text-xs text-muted-foreground">{polter.sortiment} · {polter.volumen} fm</p>
          </div>

          <div className="flex gap-2 rounded-lg bg-muted p-1">
            <button
              onClick={() => setTyp('checkin')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all ${
                typ === 'checkin' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <LogIn className="h-4 w-4" />
              Einbuchen
            </button>
            <button
              onClick={() => setTyp('checkout')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all ${
                typ === 'checkout' ? 'bg-amber-500 text-white shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <LogOut className="h-4 w-4" />
              Ausbuchen
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Menge (Festmeter)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={menge}
              onChange={(e) => setMenge(e.target.value)}
              placeholder="z.B. 35.2"
              className="h-12 w-full rounded-lg border bg-background px-4 text-lg font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:bg-muted">
            <Camera className="h-4 w-4" />
            Foto aufnehmen oder hochladen
          </button>

          {recentBookings.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Letzte Buchungen</p>
              <div className="space-y-1.5">
                {recentBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-xs">
                    <span className="text-muted-foreground">
                      {format(new Date(b.erstelltAm), 'dd.MM.yy HH:mm', { locale: de })} · {b.typ === 'checkin' ? 'Ein' : 'Aus'}
                    </span>
                    <span className={`font-semibold ${b.typ === 'checkin' ? 'text-primary' : 'text-amber-600'}`}>
                      {b.typ === 'checkin' ? '+' : '-'}{b.menge} fm
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            className={`flex h-14 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold text-white shadow-lg transition-all active:scale-[0.98] ${
              typ === 'checkin'
                ? 'bg-primary hover:bg-primary/90'
                : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            <Check className="h-5 w-5" />
            Buchung bestätigen
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
