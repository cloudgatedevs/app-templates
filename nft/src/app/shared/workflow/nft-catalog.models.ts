export interface NftCatalogItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  amount?: string;
  rating?: string;
  location?: string;
}

export interface NftCatalog {
  forYou: NftCatalogItem[];
  favourites: NftCatalogItem[];
  exploreRecent: NftCatalogItem[];
  explore: NftCatalogItem[];
}

export const EMPTY_NFTCATALOG: NftCatalog = {
  forYou: [],
  favourites: [],
  exploreRecent: [],
  explore: [],
};

