import React, { createContext, useContext, useState, useCallback } from 'react';
import { UserRole, Polter, Booking, BookingType } from '@/lib/types';
import { mockPolter, mockBookings } from '@/lib/mock-data';

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
  addBooking: (polterId: string, typ: BookingType, menge: number) => void;
  getBookingsForPolter: (polterId: string) => Booking[];
  getFilteredPolter: () => Polter[];
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('forester');
  const [polterList, setPolterList] = useState<Polter[]>(mockPolter);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [transporteure, setTransporteure] = useState<Partner[]>(initialTransporteure);
  const [kaeufer, setKaeufer] = useState<Partner[]>(initialKaeufer);

  const addPolter = useCallback((polter: Polter) => {
    setPolterList(prev => [...prev, polter]);
  }, []);

  const updatePolter = useCallback((polter: Polter) => {
    setPolterList(prev => prev.map(p => p.id === polter.id ? polter : p));
  }, []);

  const addBooking = useCallback((polterId: string, typ: BookingType, menge: number) => {
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
  }, [role]);

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
    <AppContext.Provider value={{ role, setRole, polterList, bookings, transporteure, kaeufer, addPolter, updatePolter, addBooking, getBookingsForPolter, getFilteredPolter, addTransporteur, addKaeufer }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
