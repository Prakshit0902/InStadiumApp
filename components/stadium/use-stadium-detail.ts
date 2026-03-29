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

export function useStadiumDetail(stadiumId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stadium, setStadium] = useState<ApiStadiumDetail | null>(null);
  const [allStadiums, setAllStadiums] = useState<ApiStadiumCard[]>([]);
  const [players, setPlayers] = useState<ApiPlayer[]>([]);
  const [sports, setSports] = useState<ApiSport[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      const base = getApiBaseUrl();
      if (!base || !stadiumId) {
        setError('Missing API configuration.');
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const [detailRes, listRes, sportsRes, playersRes] = await Promise.all([
          fetch(`${base}/api/stadiums/${stadiumId}`),
          fetch(`${base}/api/stadiums`),
          fetch(`${base}/api/sports`),
          fetch(`${base}/api/players?stadiumId=${stadiumId}`),
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
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load stadium details.');
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
