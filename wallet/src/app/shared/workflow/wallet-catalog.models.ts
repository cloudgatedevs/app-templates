export interface WalletCatalogItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  amount?: string;
  rating?: string;
  location?: string;
}

export interface WalletCatalog {
  forYou: WalletCatalogItem[];
  favourites: WalletCatalogItem[];
  exploreRecent: WalletCatalogItem[];
  explore: WalletCatalogItem[];
}

export const EMPTY_WALLETCATALOG: WalletCatalog = {
  forYou: [],
  favourites: [],
  exploreRecent: [],
  explore: [],
};

