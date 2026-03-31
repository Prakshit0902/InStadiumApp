import { useEffect, useState } from 'react';
import {
  fallbackFeaturedStadiums,
  getSportIconByName,
  nearbyStadiums as fallbackNearbyStadiums,
  sports as fallbackSports,
} from './data';
import { ApiSportResponse, ApiStadium, NearbyStadium, SportItem, Stadium } from './types';

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getFirstGalleryImage(galleryImages: unknown): string | undefined {
  if (!Array.isArray(galleryImages)) {
    return undefined;
  }

  for (const item of galleryImages) {
    if (typeof item === 'string' && item.trim()) {
      return item;
    }

    if (item && typeof item === 'object' && 'url' in item) {
      const url = (item as { url?: unknown }).url;
      if (typeof url === 'string' && url.trim()) {
        return url;
      }
    }
  }

  return undefined;
}

function toSafeId(stadium: ApiStadium) {
  const raw = stadium.id ? String(stadium.id).trim() : '';
  if (raw) {
    return raw;
  }

  return toSlug(stadium.name || 'stadium');
}

function getApiBaseUrl() {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL;
  return base ? base.replace(/\/$/, '') : null;
}

function toLandingStadium(stadium: ApiStadium): Stadium {
  const primaryImage = getFirstGalleryImage(stadium.galleryImages);

  return {
    id: toSafeId(stadium),
    name: stadium.name,
    city: stadium.city,
    capacity: stadium.capacity,
    sport: stadium.sportsPlayed?.[0]?.name,
    image: primaryImage,
  };
}

function toNearby(stadium: ApiStadium, index: number): NearbyStadium {
  const defaultDistances = ['12.5 km', '4.2 km', '8.7 km', '15.3 km'];
  const image = getFirstGalleryImage(stadium.galleryImages) || '';

  return {
    id: toSafeId(stadium),
    name: stadium.name,
    city: stadium.city,
    distance: defaultDistances[index] || `${10 + index}.0 km`,
    image,
  };
}

async function fetchStadiums(baseUrl: string) {
  const response = await fetch(`${baseUrl}/api/stadiums`);

  if (!response.ok) {
    throw new Error(`Failed to fetch stadiums (${response.status})`);
  }

  return (await response.json()) as ApiStadium[];
}

async function fetchSports(baseUrl: string) {
  const response = await fetch(`${baseUrl}/api/sports`);

  if (!response.ok) {
    throw new Error(`Failed to fetch sports (${response.status})`);
  }

  return (await response.json()) as ApiSportResponse[];
}

export function useFeaturedStadiums() {
  const [featured, setFeatured] = useState<Stadium[]>(fallbackFeaturedStadiums);
  const [nearby, setNearby] = useState<NearbyStadium[]>(fallbackNearbyStadiums);
  const [sports, setSports] = useState<SportItem[]>(fallbackSports);

  useEffect(() => {
    let mounted = true;
    const base = getApiBaseUrl();

    if (!base) {
      return () => {
        mounted = false;
      };
    }

    Promise.all([fetchStadiums(base), fetchSports(base)])
      .then(([stadiums, sportsResponse]) => {
        if (!mounted) {
          return;
        }

        if (Array.isArray(stadiums) && stadiums.length > 0) {
          setFeatured(stadiums.slice(0, 3).map(toLandingStadium));

          const nearbyCandidates = stadiums.slice(3, 5);
          const nearbyData = (nearbyCandidates.length > 0 ? nearbyCandidates : stadiums.slice(0, 2)).map(toNearby);
          if (nearbyData.length > 0) {
            setNearby(nearbyData);
          }
        }

        if (Array.isArray(sportsResponse) && sportsResponse.length > 0) {
          setSports(
            sportsResponse.map((item) => ({
              name: item.name,
              icon: getSportIconByName(item.name),
            }))
          );
        }
      })
      .catch(() => {
        setFeatured(fallbackFeaturedStadiums);
        setNearby(fallbackNearbyStadiums);
        setSports(fallbackSports);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { featured, nearby, sports };
}
