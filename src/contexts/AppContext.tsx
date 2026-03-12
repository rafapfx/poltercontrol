import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { UserRole, Polter, Booking, BookingType } from '@/lib/types';
import { mockPolter, mockBookings } from '@/lib/mock-data';
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
  addPolter: (polter: Polter) => void;
  updatePolter: (polter: Polter) => void;
  addBooking: (polterId: string, typ: BookingType, menge: number) => boolean;
  getBookingsForPolter: (polterId: string) => Booking[];
  getFilteredPolter: () => Polter[];
  getBestand: (polterId: string) => number;
  getPolterById: (id: string) => Polter | undefined;
  addTransporteur: (name: string) => void;
  addKaeufer: (name: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialTransporteure: Partner[] = [
  { id: 't1', name: 'Transport Frey AG' },
  { id: 't2', name: 'Holztransporte Müller' },
  { id: 't3', name: 'Fuhrwerk Schmid GmbH' },
];

const initialKaeufer: Partner[] = [
  { id: 'b1', name: 'Sägewerk Villiger' },
  { id: 'b2', name: 'Holzhandel Zubler' },
  { id: 'b3', name: 'Biomasse Aargau AG' },
];

const STORAGE_KEYS = {
  role: 'forstcontrol.role',
  polterList: 'forstcontrol.polterList',
  bookings: 'forstcontrol.bookings',
  transporteure: 'forstcontrol.transporteure',
  kaeufer: 'forstcontrol.kaeufer',
} as const;

const readStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => readStorage<UserRole>(STORAGE_KEYS.role, 'forester'));
  const [polterList, setPolterList] = useState<Polter[]>(() => readStorage<Polter[]>(STORAGE_KEYS.polterList, mockPolter));
  const [bookings, setBookings] = useState<Booking[]>(() => readStorage<Booking[]>(STORAGE_KEYS.bookings, mockBookings));
  const [transporteure, setTransporteure] = useState<Partner[]>(() => readStorage<Partner[]>(STORAGE_KEYS.transporteure, initialTransporteure));
  const [kaeufer, setKaeufer] = useState<Partner[]>(() => readStorage<Partner[]>(STORAGE_KEYS.kaeufer, initialKaeufer));

  useEffect(() => {
    writeStorage(STORAGE_KEYS.role, role);
  }, [role]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.polterList, polterList);
  }, [polterList]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.bookings, bookings);
  }, [bookings]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.transporteure, transporteure);
  }, [transporteure]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.kaeufer, kaeufer);
  }, [kaeufer]);

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

  const addPolter = useCallback((polter: Polter) => {
    setPolterList(prev => [...prev, polter]);
  }, []);

  const updatePolter = useCallback((polter: Polter) => {
    setPolterList(prev => prev.map(p => p.id === polter.id ? polter : p));
  }, []);

  const addBooking = useCallback((polterId: string, typ: BookingType, menge: number): boolean => {
    if (typ === 'checkout') {
      const bestand = getBestand(polterId);
      if (menge > bestand) {
        toast.error(`Ausbuchung nicht möglich: Nur ${bestand.toFixed(1)} fm verfügbar`);
        return false;
      }
    }
    const booking: Booking = {
      id: `bk-${Date.now()}`,
      polterId,
      typ,
      menge,
      fotoUrl: null,
      erstelltVon: role === 'forester' ? 'Förster Meier' : role === 'transporter' ? 'Transport Frey AG' : 'Sägewerk Villiger',
      erstelltAm: new Date().toISOString(),
    };
    setBookings(prev => [...prev, booking]);
    return true;
  }, [role, getBestand]);

  const getBookingsForPolter = useCallback((polterId: string) => {
    return bookings.filter(b => b.polterId === polterId).sort((a, b) => new Date(b.erstelltAm).getTime() - new Date(a.erstelltAm).getTime());
  }, [bookings]);

  const getFilteredPolter = useCallback(() => {
    switch (role) {
      case 'forester':
        return polterList;
      case 'transporter':
        return polterList.filter(p => p.transporteurId === 't1');
      case 'buyer':
        return polterList.filter(p => p.kaeuferId === 'b1');
      default:
        return polterList;
    }
  }, [role, polterList]);

  const addTransporteur = useCallback((name: string) => {
    setTransporteure(prev => [...prev, { id: `t-${Date.now()}`, name }]);
  }, []);

  const addKaeufer = useCallback((name: string) => {
    setKaeufer(prev => [...prev, { id: `b-${Date.now()}`, name }]);
  }, []);

  return (
    <AppContext.Provider value={{ role, setRole, polterList, bookings, transporteure, kaeufer, addPolter, updatePolter, addBooking, getBookingsForPolter, getFilteredPolter, getBestand, getPolterById, addTransporteur, addKaeufer }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    console.error('AppContext missing: falling back to safe defaults');
    return {
      role: 'forester' as UserRole,
      setRole: () => {},
      polterList: mockPolter,
      bookings: mockBookings,
      transporteure: initialTransporteure,
      kaeufer: initialKaeufer,
      addPolter: () => {},
      updatePolter: () => {},
      addBooking: () => false,
      getBookingsForPolter: (polterId: string) => mockBookings.filter(b => b.polterId === polterId),
      getFilteredPolter: () => mockPolter,
      getBestand: (polterId: string) => {
        const polter = mockPolter.find(p => p.id === polterId);
        const initialVolumen = polter?.volumen ?? 0;
        const buchungen = mockBookings.filter(b => b.polterId === polterId);
        const einbuchungen = buchungen.filter(b => b.typ === 'checkin').reduce((sum, b) => sum + b.menge, 0);
        const ausbuchungen = buchungen.filter(b => b.typ === 'checkout').reduce((sum, b) => sum + b.menge, 0);
        return initialVolumen + einbuchungen - ausbuchungen;
      },
      getPolterById: (id: string) => mockPolter.find(p => p.id === id),
      addTransporteur: () => {},
      addKaeufer: () => {},
    };
  }
  return ctx;
};
