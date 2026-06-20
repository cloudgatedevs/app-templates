export interface PodcastItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  audioUrl?: string;
  durationSeconds?: number;
  progressSeconds?: number;
  captionLines?: string[];
}

export interface PodcastCatalog {
  featured: PodcastItem[];
  trending: PodcastItem[];
  categories: PodcastItem[];
  playlists: PodcastItem[];
}

export const EMPTY_PODCAST_CATALOG: PodcastCatalog = {
  featured: [],
  trending: [],
  categories: [],
  playlists: [],
};
