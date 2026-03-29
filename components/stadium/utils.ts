import { fallbackRulebook } from './rulebook-data';
import { ApiSport, GalleryImage, RuleSection } from './types';

export function getApiBaseUrl() {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL;
  return base ? base.replace(/\/$/, '') : null;
}

export function parseArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  return [];
}

export function firstGalleryUrl(galleryValue: unknown) {
  const gallery = parseArray<GalleryImage | string>(galleryValue);
  const first = gallery[0];

  if (!first) {
    return undefined;
  }

  if (typeof first === 'string') {
    return first;
  }

  return first.url;
}

export function getDistanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earth = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return earth * c;
}

export function formatDate(value?: string) {
  if (!value) {
    return 'TBA';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function buildRuleSections(sport: ApiSport | undefined): RuleSection[] {
  if (!sport) {
    return [];
  }

  const key = sport.name.trim().toLowerCase();
  const fallback = fallbackRulebook[key] || [];
  const videoArray = parseArray<{ title?: string; url?: string; description?: string }>(sport.rulebookVideos);

  if (videoArray.length === 0) {
    return fallback;
  }

  const fromVideos = videoArray.slice(0, 4).map((item, index) => ({
    title: item.title || `Guide ${index + 1}`,
    content: item.description || 'Open the linked video guide to learn this section in detail.',
  }));

  return [...fromVideos, ...fallback].slice(0, 6);
}
