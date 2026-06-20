export interface MedicalDoctor {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  amount?: string;
  rating?: string;
  location?: string;
}

export interface MedicalCatalog {
  forYou: MedicalDoctor[];
  favourites: MedicalDoctor[];
  exploreRecent: MedicalDoctor[];
  explore: MedicalDoctor[];
}

export const EMPTY_MEDICAL_CATALOG: MedicalCatalog = {
  forYou: [],
  favourites: [],
  exploreRecent: [],
  explore: [],
};
