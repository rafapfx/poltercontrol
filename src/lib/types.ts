export type UserRole = 'forester' | 'transporter' | 'buyer';

export type PolterStatus = 'Neu' | 'Bereit' | 'Transport zugewiesen' | 'Abgeholt' | 'Geliefert';

export type BookingType = 'checkin' | 'checkout';

export interface Polter {
  id: string;
  name: string;
  sortiment: string;
  volumen: number;
  beschreibung: string;
  lat: number;
  lng: number;
  eudrNummer: string;
  status: PolterStatus;
  forstbetrieb: string;
  transporteurId: string | null;
  transporteurName: string | null;
  kaeuferId: string | null;
  kaeuferName: string | null;
  erstelltAm: string;
}

export interface Booking {
  id: string;
  polterId: string;
  typ: BookingType;
  menge: number;
  fotoUrl: string | null;
  erstelltVon: string;
  erstelltAm: string;
}
