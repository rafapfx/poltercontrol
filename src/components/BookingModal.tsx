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
  const { addBooking, getBookingsForPolter, getBestand } = useApp();
  const recentBookings = getBookingsForPolter(polter.id).slice(0, 3);
  const bestand = getBestand(polter.id);

  const handleSubmit = () => {
    const val = parseFloat(menge);
    if (!val || val <= 0) {
      toast.error('Bitte gültige Menge eingeben');
      return;
    }
    const success = addBooking(polter.id, typ, val);
    if (success) {
      toast.success(`${typ === 'checkin' ? 'Einbuchung' : 'Ausbuchung'} erfolgreich: ${val} fm`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-card sm:rounded-2xl max-h-[90vh] overflow-y-auto overscroll-contain shadow-2xl">
        {/* Drag indicator for mobile */}
        <div className="flex justify-center pt-2 pb-0 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 sticky top-0 bg-card z-10">
          <h2 className="text-lg font-semibold text-foreground">Buchung</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 px-5 pb-8">
          <div className="rounded-xl bg-muted/50 px-4 py-3">
            <p className="text-sm text-muted-foreground">Polter</p>
            <p className="font-medium text-foreground">{polter.name}</p>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{polter.sortiment}</span>
              <span className="text-sm font-semibold text-primary">Bestand: {bestand.toFixed(1)} fm</span>
            </div>
          </div>

          <div className="flex gap-2 rounded-xl bg-muted p-1">
            <button
              onClick={() => setTyp('checkin')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all ${
                typ === 'checkin' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <LogIn className="h-4 w-4" />
              Einbuchen
            </button>
            <button
              onClick={() => setTyp('checkout')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all ${
                typ === 'checkout' ? 'bg-amber-500 text-white shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <LogOut className="h-4 w-4" />
              Ausbuchen
            </button>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Menge (Festmeter)
              {typ === 'checkout' && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">Max: {bestand.toFixed(1)} fm</span>
              )}
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              max={typ === 'checkout' ? bestand : undefined}
              value={menge}
              onChange={(e) => setMenge(e.target.value)}
              placeholder="z.B. 35.2"
              className="h-14 w-full rounded-xl border bg-background px-4 text-lg font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>

          <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3.5 text-sm text-muted-foreground transition-colors hover:bg-muted active:bg-muted/80">
            <Camera className="h-4 w-4" />
            Foto aufnehmen oder hochladen
          </button>

          {recentBookings.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Letzte Buchungen</p>
              <div className="space-y-1.5">
                {recentBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5 text-xs">
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
            className={`flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-semibold text-white shadow-lg transition-all active:scale-[0.97] ${
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
