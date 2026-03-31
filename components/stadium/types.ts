export type ApiSport = {
  id: string;
  name: string;
  description?: string;
  rulebookVideos?: unknown;
};

export type ApiPlayer = {
  id: string;
  name: string;
  country?: string;
  image?: string | null;
  bio?: string | null;
  achievements?: unknown;
  careerTimeline?: unknown;
  stats?: unknown;
  stadiumsPlayed?: ApiStadiumCard[];
  sport?: ApiSport;
};

export type TimelineItem = {
  year?: string | number;
  title?: string;
  event?: string;
  description?: string;
  videoUrl?: string;
  thumbnail?: string;
};

export type MatchItem = {
  teams?: string;
  date?: string;
  tournament?: string;
};

export type NearbyPlace = {
  name?: string;
  distance?: string;
  type?: string;
};

export type GalleryImage = {
  url?: string;
  caption?: string;
};

export type ApiStadiumDetail = {
  id: string;
  name: string;
  city: string;
  state?: string;
  country?: string;
  capacity?: number;
  builtYear?: number;
  description?: string;
  latitude?: number | null;
  longitude?: number | null;
  sportsPlayed?: ApiSport[];
  players?: ApiPlayer[];
  galleryImages?: unknown;
  historyTimeline?: unknown;
  upcomingMatches?: unknown;
  nearbyPlaces?: unknown;
};

export type ApiStadiumCard = {
  id: string;
  name: string;
  city: string;
  state?: string;
  latitude?: number | null;
  longitude?: number | null;
  galleryImages?: unknown;
  sportsPlayed?: ApiSport[];
};

export type RuleSection = {
  title: string;
  content: string;
};

export type NearbyStadium = ApiStadiumCard & { distanceKm?: number };
