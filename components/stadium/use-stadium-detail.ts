import { useEffect, useMemo, useState } from 'react';
import {
  ApiPlayer,
  ApiSport,
  ApiStadiumCard,
  ApiStadiumDetail,
  GalleryImage,
  MatchItem,
  NearbyPlace,
  NearbyStadium,
  RuleSection,
  TimelineItem,
} from './types';
import { buildRuleSections, getApiBaseUrl, getDistanceKm, parseArray } from './utils';
import { fallbackFeaturedStadiums, nearbyStadiums as landingNearbyStadiums } from '@/components/landing/data';

function decodeParam(value: string | undefined) {
  if (!value) {
    return '';
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function toTitleFromSlug(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function toFallbackCards(): ApiStadiumCard[] {
  return [
    ...fallbackFeaturedStadiums.map((item) => ({
      id: item.id,
      name: item.name,
      city: item.city,
      galleryImages: item.image ? [{ url: item.image }] : [],
      sportsPlayed: item.sport ? [{ id: item.sport.toLowerCase(), name: item.sport }] : [],
    })),
    ...landingNearbyStadiums.map((item) => ({
      id: item.id,
      name: item.name,
      city: item.city,
      galleryImages: typeof item.image === 'string' ? [{ url: item.image }] : [],
      sportsPlayed: [],
    })),
  ];
}

function createFallbackStadiumDetail(stadiumId: string): ApiStadiumDetail {
  const cards = toFallbackCards();
  const card = cards.find((item) => item.id === stadiumId);
  const name = card?.name || toTitleFromSlug(stadiumId || 'stadium');
  const city = card?.city || 'Mumbai';

  return {
    id: stadiumId,
    name,
    city,
    state: 'Maharashtra',
    country: 'India',
    capacity: 33000,
    builtYear: 1974,
    description:
      'An iconic Indian venue known for electric crowds, landmark fixtures, and a rich sporting legacy.',
    sportsPlayed: card?.sportsPlayed || [],
    galleryImages: card?.galleryImages || [],
    historyTimeline: [
      { year: '1974', event: 'Stadium inaugurated for major domestic fixtures.' },
      { year: '2011', event: 'Hosted globally celebrated championship moments.' },
      { year: '2023', event: 'Infrastructure and fan-experience upgrades completed.' },
    ],
    upcomingMatches: [{ teams: 'Home XI vs Visitors XI', date: '2026-05-14', tournament: 'Premier Fixture' }],
    nearbyPlaces: [
      { name: 'City Transport Hub', distance: '2.1 km', type: 'Transit' },
      { name: 'Fan Park', distance: '1.4 km', type: 'Leisure' },
    ],
    players: [],
  };
}

export function useStadiumDetail(stadiumId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stadium, setStadium] = useState<ApiStadiumDetail | null>(null);
  const [allStadiums, setAllStadiums] = useState<ApiStadiumCard[]>([]);
  const [players, setPlayers] = useState<ApiPlayer[]>([]);
  const [sports, setSports] = useState<ApiSport[]>([]);

  useEffect(() => {
    let mounted = true;
    const normalizedStadiumId = decodeParam(stadiumId);

    async function loadData() {
      const base = getApiBaseUrl();
      if (!normalizedStadiumId) {
        setError('Missing stadium id.');
        setLoading(false);
        return;
      }

      if (!base) {
        if (!mounted) {
          return;
        }

        const fallbackDetail = createFallbackStadiumDetail(normalizedStadiumId);
        setError(null);
        setStadium(fallbackDetail);
        setAllStadiums(toFallbackCards());
        setSports([]);
        setPlayers([]);
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const [detailRes, listRes, sportsRes, playersRes] = await Promise.all([
          fetch(`${base}/api/stadiums/${encodeURIComponent(normalizedStadiumId)}`),
          fetch(`${base}/api/stadiums`),
          fetch(`${base}/api/sports`),
          fetch(`${base}/api/players?stadiumId=${encodeURIComponent(normalizedStadiumId)}`),
        ]);

        if (!detailRes.ok) {
          throw new Error('Unable to load stadium details.');
        }

        const detailData = (await detailRes.json()) as ApiStadiumDetail;
        const listData = listRes.ok ? ((await listRes.json()) as ApiStadiumCard[]) : [];
        const sportsData = sportsRes.ok ? ((await sportsRes.json()) as ApiSport[]) : [];
        const playersData = playersRes.ok ? ((await playersRes.json()) as ApiPlayer[]) : [];

        if (!mounted) {
          return;
        }

        setStadium(detailData);
        setAllStadiums(Array.isArray(listData) ? listData : []);
        setSports(Array.isArray(sportsData) ? sportsData : []);
        setPlayers(Array.isArray(playersData) && playersData.length > 0 ? playersData : detailData.players || []);
      } catch {
        if (mounted) {
          const fallbackDetail = createFallbackStadiumDetail(normalizedStadiumId);
          setError(null);
          setStadium(fallbackDetail);
          setAllStadiums(toFallbackCards());
          setSports([]);
          setPlayers([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [stadiumId]);

  const gallery = useMemo(() => parseArray<GalleryImage | string>(stadium?.galleryImages), [stadium]);
  const timeline = useMemo(() => parseArray<TimelineItem>(stadium?.historyTimeline), [stadium]);
  const matches = useMemo(() => parseArray<MatchItem>(stadium?.upcomingMatches), [stadium]);
  const nearbyPlaces = useMemo(() => parseArray<NearbyPlace>(stadium?.nearbyPlaces), [stadium]);

  const stadiumSports = useMemo(() => {
    if (!stadium?.sportsPlayed || stadium.sportsPlayed.length === 0) {
      return [] as ApiSport[];
    }

    return stadium.sportsPlayed
      .map((item) => sports.find((sport) => sport.id === item.id) || item)
      .filter(Boolean);
  }, [sports, stadium]);

  const primarySport = stadiumSports[0];

  const nearbyStadiums = useMemo(() => {
    if (!stadium) {
      return [] as NearbyStadium[];
    }

    return allStadiums
      .filter((item) => item.id !== stadium.id)
      .map((item) => {
        const canMeasure =
          typeof stadium.latitude === 'number' &&
          typeof stadium.longitude === 'number' &&
          typeof item.latitude === 'number' &&
          typeof item.longitude === 'number';

        return {
          ...item,
          distanceKm: canMeasure ? getDistanceKm(stadium.latitude!, stadium.longitude!, item.latitude!, item.longitude!) : undefined,
        };
      })
      .sort((a, b) => {
        if (typeof a.distanceKm === 'number' && typeof b.distanceKm === 'number') {
          return a.distanceKm - b.distanceKm;
        }

        if (a.city === stadium.city && b.city !== stadium.city) {
          return -1;
        }

        if (a.city !== stadium.city && b.city === stadium.city) {
          return 1;
        }

        return a.name.localeCompare(b.name);
      })
      .slice(0, 4);
  }, [allStadiums, stadium]);

  const globalMapList = useMemo(
    () => allStadiums.filter((item) => typeof item.latitude === 'number' && typeof item.longitude === 'number'),
    [allStadiums]
  );

  const ruleSections: RuleSection[] = useMemo(() => buildRuleSections(primarySport), [primarySport]);

  return {
    loading,
    error,
    stadium,
    players,
    gallery,
    timeline,
    matches,
    nearbyPlaces,
    stadiumSports,
    primarySport,
    nearbyStadiums,
    globalMapList,
    ruleSections,
  };
}
