import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { UserRole, Polter, Booking, BookingType, PolterStatus } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Partner {
  id: string;
  name: string;
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  polterList: Polter[];
  bookings: Booking[];
  transporteure: Partner[];
  kaeufer: Partner[];
  loading: boolean;
  addPolter: (polter: Omit<Polter, 'id'>) => Promise<void>;
  updatePolter: (polter: Polter) => Promise<void>;
  deletePolter: (id: string) => Promise<void>;
  addBooking: (polterId: string, typ: BookingType, menge: number) => Promise<boolean>;
  getBookingsForPolter: (polterId: string) => Booking[];
  getFilteredPolter: () => Polter[];
  getBestand: (polterId: string) => number;
  getPolterById: (id: string) => Polter | undefined;
  addTransporteur: (name: string) => Promise<void>;
  addKaeufer: (name: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Map DB row to app type
const mapPolterRow = (row: any): Polter => ({
  id: row.id,
  name: row.name,
  sortiment: row.sortiment,
  volumen: Number(row.volumen),
  beschreibung: row.beschreibung,
  lat: row.lat,
  lng: row.lng,
  eudrNummer: row.eudr_nummer,
  status: row.status as PolterStatus,
  forstbetrieb: row.forstbetrieb,
  transporteurId: row.transporteur_id,
  transporteurName: row.transporteur_name,
  kaeuferId: row.kaeufer_id,
  kaeuferName: row.kaeufer_name,
  erstelltAm: row.created_at,
});

const mapBookingRow = (row: any): Booking => ({
  id: row.id,
  polterId: row.polter_id,
  typ: row.typ as BookingType,
  menge: Number(row.menge),
  fotoUrl: row.foto_url,
  erstelltVon: row.erstellt_von,
  erstelltAm: row.created_at,
});

const ROLE_KEY = 'forstcontrol.role';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    try {
      return (localStorage.getItem(ROLE_KEY) as UserRole) || 'forester';
    } catch { return 'forester'; }
  });
  const [polterList, setPolterList] = useState<Polter[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transporteure, setTransporteure] = useState<Partner[]>([]);
  const [kaeufer, setKaeufer] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  const setRole = useCallback((r: UserRole) => {
    setRoleState(r);
    try { localStorage.setItem(ROLE_KEY, r); } catch {}
  }, []);

  // Fetch all data on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [polterRes, bookingsRes, partnersRes] = await Promise.all([
        supabase.from('polter').select('*').order('created_at', { ascending: false }),
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('partners').select('*').order('name'),
      ]);

      if (polterRes.data) setPolterList(polterRes.data.map(mapPolterRow));
      if (bookingsRes.data) setBookings(bookingsRes.data.map(mapBookingRow));
      if (partnersRes.data) {
        setTransporteure(partnersRes.data.filter(p => p.typ === 'transporteur').map(p => ({ id: p.id, name: p.name })));
        setKaeufer(partnersRes.data.filter(p => p.typ === 'kaeufer').map(p => ({ id: p.id, name: p.name })));
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const getBestand = useCallback((polterId: string) => {
    const polter = polterList.find(p => p.id === polterId);
    const initialVolumen = polter?.volumen ?? 0;
    const buchungen = bookings.filter(b => b.polterId === polterId);
    const einbuchungen = buchungen.filter(b => b.typ === 'checkin').reduce((sum, b) => sum + b.menge, 0);
    const ausbuchungen = buchungen.filter(b => b.typ === 'checkout').reduce((sum, b) => sum + b.menge, 0);
    return initialVolumen + einbuchungen - ausbuchungen;
  }, [bookings, polterList]);

  const getPolterById = useCallback((id: string) => {
    return polterList.find(p => p.id === id);
  }, [polterList]);

  const addPolter = useCallback(async (polter: Omit<Polter, 'id'>) => {
    const { data, error } = await supabase.from('polter').insert({
      name: polter.name,
      sortiment: polter.sortiment,
      volumen: polter.volumen,
      beschreibung: polter.beschreibung,
      lat: polter.lat,
      lng: polter.lng,
      eudr_nummer: polter.eudrNummer,
      status: polter.status as any,
      forstbetrieb: polter.forstbetrieb,
      transporteur_id: polter.transporteurId,
      transporteur_name: polter.transporteurName,
      kaeufer_id: polter.kaeuferId,
      kaeufer_name: polter.kaeuferName,
    }).select().single();

    if (error) {
      toast.error('Fehler beim Speichern: ' + error.message);
      return;
    }
    if (data) {
      setPolterList(prev => [mapPolterRow(data), ...prev]);
    }
  }, []);

  const updatePolter = useCallback(async (polter: Polter) => {
    const { error } = await supabase.from('polter').update({
      name: polter.name,
      sortiment: polter.sortiment,
      volumen: polter.volumen,
      beschreibung: polter.beschreibung,
      lat: polter.lat,
      lng: polter.lng,
      eudr_nummer: polter.eudrNummer,
      status: polter.status as any,
      forstbetrieb: polter.forstbetrieb,
      transporteur_id: polter.transporteurId,
      transporteur_name: polter.transporteurName,
      kaeufer_id: polter.kaeuferId,
      kaeufer_name: polter.kaeuferName,
    }).eq('id', polter.id);

    if (error) {
      toast.error('Fehler beim Aktualisieren: ' + error.message);
      return;
    }
    setPolterList(prev => prev.map(p => p.id === polter.id ? polter : p));
  }, []);

  const addBooking = useCallback(async (polterId: string, typ: BookingType, menge: number): Promise<boolean> => {
    if (typ === 'checkout') {
      const bestand = getBestand(polterId);
      if (menge > bestand) {
        toast.error(`Ausbuchung nicht möglich: Nur ${bestand.toFixed(1)} fm verfügbar`);
        return false;
      }
    }

    const erstelltVon = role === 'forester' ? 'Förster Meier' : role === 'transporter' ? 'Transport Frey AG' : 'Sägewerk Villiger';

    const { data, error } = await supabase.from('bookings').insert({
      polter_id: polterId,
      typ: typ as any,
      menge,
      erstellt_von: erstelltVon,
    }).select().single();

    if (error) {
      toast.error('Fehler beim Buchen: ' + error.message);
      return false;
    }
    if (data) {
      setBookings(prev => [mapBookingRow(data), ...prev]);
    }
    return true;
  }, [role, getBestand]);

  const getBookingsForPolter = useCallback((polterId: string) => {
    return bookings.filter(b => b.polterId === polterId).sort((a, b) => new Date(b.erstelltAm).getTime() - new Date(a.erstelltAm).getTime());
  }, [bookings]);

  const getFilteredPolter = useCallback(() => {
    // For now show all polter for all roles (no auth yet)
    return polterList;
  }, [polterList]);

  const addTransporteur = useCallback(async (name: string) => {
    const { data, error } = await supabase.from('partners').insert({ name, typ: 'transporteur' }).select().single();
    if (error) {
      toast.error('Fehler: ' + error.message);
      return;
    }
    if (data) {
      setTransporteure(prev => [...prev, { id: data.id, name: data.name }]);
    }
  }, []);

  const addKaeufer = useCallback(async (name: string) => {
    const { data, error } = await supabase.from('partners').insert({ name, typ: 'kaeufer' }).select().single();
    if (error) {
      toast.error('Fehler: ' + error.message);
      return;
    }
    if (data) {
      setKaeufer(prev => [...prev, { id: data.id, name: data.name }]);
    }
  }, []);

  return (
    <AppContext.Provider value={{ role, setRole, polterList, bookings, transporteure, kaeufer, loading, addPolter, updatePolter, addBooking, getBookingsForPolter, getFilteredPolter, getBestand, getPolterById, addTransporteur, addKaeufer }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
};
