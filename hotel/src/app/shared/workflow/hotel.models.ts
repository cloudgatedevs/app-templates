export interface HotelPlace {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  amount?: string;
  rating?: string;
  location?: string;
}

export interface HotelCatalog {
  forYou: HotelPlace[];
  favourites: HotelPlace[];
  exploreRecent: HotelPlace[];
  explore: HotelPlace[];
}

export const EMPTY_HOTEL_CATALOG: HotelCatalog = {
  forYou: [],
  favourites: [],
  exploreRecent: [],
  explore: [],
};
