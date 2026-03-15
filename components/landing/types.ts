export type Stadium = {
  id: string;
  name: string;
  city: string;
  capacity?: number;
  sport?: string;
  image?: string;
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
  image: number;
};
