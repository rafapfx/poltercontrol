import React, { createContext, useContext, useState, useCallback } from 'react';
import { UserRole, Polter, Booking, BookingType } from '@/lib/types';
import { mockPolter, mockBookings } from '@/lib/mock-data';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  polterList: Polter[];
  bookings: Booking[];
  addPolter: (polter: Polter) => void;
  updatePolter: (polter: Polter) => void;
  addBooking: (polterId: string, typ: BookingType, menge: number) => void;
  getBookingsForPolter: (polterId: string) => Booking[];
  getFilteredPolter: () => Polter[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('forester');
  const [polterList, setPolterList] = useState<Polter[]>(mockPolter);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);

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
      erstelltVon: role === 'forester' ? 'Förster Müller' : role === 'transporter' ? 'Spedition Huber' : 'Sägewerk Berger',
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

  return (
    <AppContext.Provider value={{ role, setRole, polterList, bookings, addPolter, updatePolter, addBooking, getBookingsForPolter, getFilteredPolter }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
