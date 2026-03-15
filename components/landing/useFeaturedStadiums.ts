import { useEffect, useState } from 'react';
import { fallbackFeaturedStadiums } from './data';
import { Stadium } from './types';

async function fetchStadiums() {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!base) {
    return null;
  }

  const response = await fetch(`${base.replace(/\/$/, '')}/api/stadiums`);
  if (!response.ok) {
    throw new Error(`Failed to fetch stadiums (${response.status})`);
  }

  return (await response.json()) as Stadium[];
}

export function useFeaturedStadiums() {
  const [featured, setFeatured] = useState<Stadium[]>(fallbackFeaturedStadiums);

  useEffect(() => {
    let mounted = true;

    fetchStadiums()
      .then((data) => {
        if (!mounted || !data || data.length === 0) {
          return;
        }

        const normalized = data.slice(0, 3).map((stadium) => ({
          ...stadium,
          image:
            stadium.image && typeof stadium.image === 'string'
              ? stadium.image.toLowerCase().replace(/\.(png|jpg|jpeg|webp)$/i, '')
              : undefined,
        }));

        setFeatured(normalized);
      })
      .catch(() => {
        setFeatured(fallbackFeaturedStadiums);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return featured;
}
