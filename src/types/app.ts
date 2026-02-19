// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export interface Dozenten {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    email?: string;
    telefon?: string;
    fachgebiet?: string;
    name?: string;
  };
}

export interface Teilnehmer {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    name?: string;
    email?: string;
    telefon?: string;
    geburtsdatum?: string; // Format: YYYY-MM-DD oder ISO String
  };
}

export interface Raeume {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    raumname?: string;
    gebaeude?: string;
    kapazitaet?: number;
  };
}

export interface Kurse {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    titel?: string;
    beschreibung?: string;
    startdatum?: string; // Format: YYYY-MM-DD oder ISO String
    enddatum?: string; // Format: YYYY-MM-DD oder ISO String
    max_teilnehmer?: number;
    preis?: number;
    dozent?: string; // applookup -> URL zu 'Dozenten' Record
    raum?: string; // applookup -> URL zu 'Raeume' Record
  };
}

export interface Anmeldungen {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    teilnehmer?: string; // applookup -> URL zu 'Teilnehmer' Record
    kurs?: string; // applookup -> URL zu 'Kurse' Record
    anmeldedatum?: string; // Format: YYYY-MM-DD oder ISO String
    bezahlt?: boolean;
  };
}

export const APP_IDS = {
  DOZENTEN: '69972adf247524a6190b659f',
  TEILNEHMER: '69972adf842c1817a4cba368',
  RAEUME: '69972adfd1e12b7c0c62bcac',
  KURSE: '69972ae02ede6edda95620e2',
  ANMELDUNGEN: '69972ae09625284049f25513',
} as const;

// Helper Types for creating new records
export type CreateDozenten = Dozenten['fields'];
export type CreateTeilnehmer = Teilnehmer['fields'];
export type CreateRaeume = Raeume['fields'];
export type CreateKurse = Kurse['fields'];
export type CreateAnmeldungen = Anmeldungen['fields'];