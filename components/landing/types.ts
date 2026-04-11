export type Stadium = {
  id: string;
  name: string;
  city: string;
  capacity?: number;
  sport?: string;
  image?: string | number;
};


export type SportItem = {
  name: string;
  icon: number;
};

export type NearbyStadium = {
  id: string;
  name: string;
  city: string;
  distance: string;
  image: string | number;
  type?: 'stadium' | 'sport' | 'player';
};

export type ApiSport = {
  id: string;
  name: string;
};

export type ApiGalleryImage = {
  url?: string;
  caption?: string;
};

export type ApiStadium = {
  id: string;
  name: string;
  city: string;
  capacity?: number;
  galleryImages?: ApiGalleryImage[] | null;
  sportsPlayed?: ApiSport[];
};

export type ApiSportResponse = {
  id: string;
  name: string;
};
