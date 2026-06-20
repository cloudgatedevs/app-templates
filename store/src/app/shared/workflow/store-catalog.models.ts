export interface StoreCatalogItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  amount?: string;
  rating?: string;
  location?: string;
}

export interface StoreCatalog {
  forYou: StoreCatalogItem[];
  favourites: StoreCatalogItem[];
  exploreRecent: StoreCatalogItem[];
  explore: StoreCatalogItem[];
}

export const EMPTY_STORECATALOG: StoreCatalog = {
  forYou: [],
  favourites: [],
  exploreRecent: [],
  explore: [],
};

