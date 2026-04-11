import { NearbyStadium, SportItem, Stadium } from './types';

export const sports: SportItem[] = [
  { name: 'Cricket', icon: require('@/assets/images/landing/sportsIcon/cricket.png') },
  { name: 'Football', icon: require('@/assets/images/landing/sportsIcon/football.png') },
  { name: 'Kabaddi', icon: require('@/assets/images/landing/sportsIcon/kabaddi.png') },
  { name: 'Badminton', icon: require('@/assets/images/landing/sportsIcon/badminton.png') },
  { name: 'Tennis', icon: require('@/assets/images/landing/sportsIcon/tennis.png') },
  { name: 'Hockey', icon: require('@/assets/images/landing/sportsIcon/hockey.png') },
];

const sportIconMap: Record<string, number> = {
  cricket: require('@/assets/images/landing/sportsIcon/cricket.png'),
  football: require('@/assets/images/landing/sportsIcon/football.png'),
  kabaddi: require('@/assets/images/landing/sportsIcon/kabaddi.png'),
  badminton: require('@/assets/images/landing/sportsIcon/badminton.png'),
  tennis: require('@/assets/images/landing/sportsIcon/tennis.png'),
  hockey: require('@/assets/images/landing/sportsIcon/hockey.png'),
};

export const nearbyStadiums: NearbyStadium[] = [
  {
    id: 'dy-patil-stadium',
    name: 'DY Patil Stadium',
    city: 'Navi Mumbai',
    distance: '12.5 km',
    image: 'https://res.cloudinary.com/daud2uqqf/image/upload/v1774784839/instadium/stadiums/other/dypatilstadium.jpg',
  },
  {
    id: 'm-chinnaswamy-stadium',
    name: 'M. Chinnaswamy Stadium',
    city: 'Bengaluru',
    distance: '4.2 km',
    image: 'https://res.cloudinary.com/daud2uqqf/image/upload/v1774784837/instadium/stadiums/other/chinnaswamystadium.jpg',
  },
];

export const fallbackFeaturedStadiums: Stadium[] = [
  {
    id: 'wankhede-stadium',
    name: 'Wankhede Stadium',
    city: 'Mumbai',
    capacity: 33000,
    sport: 'Cricket',
    image: 'wankhedestadium',
  },
  {
    id: 'narendra-modi-stadium',
    name: 'Narendra Modi Stadium',
    city: 'Ahmedabad',
    capacity: 132000,
    sport: 'Cricket',
    image: 'narendramodistadium',
  },
  {
    id: 'salt-lake',
    name: 'Salt Lake Stadium',
    city: 'Kolkata',
    capacity: 85000,
    sport: 'Football',
    image: 'saltlakestadium',
  },
];

const fallbackByPublicId: Record<string, number> = {
  wankhedestadium: require('@/assets/images/landing/stadiums/wankhedestadium.jpg'),
  'stadiums/wankhedestadium': require('@/assets/images/landing/stadiums/wankhedestadium.jpg'),
  'instadium/stadiums/wankhedestadium': require('@/assets/images/landing/stadiums/wankhedestadium.jpg'),
  narendramodistadium: require('@/assets/images/landing/stadiums/narendramodistadium.jpg'),
  'stadiums/narendramodistadium': require('@/assets/images/landing/stadiums/narendramodistadium.jpg'),
  'instadium/stadiums/narendramodistadium': require('@/assets/images/landing/stadiums/narendramodistadium.jpg'),
  saltlakestadium: require('@/assets/images/landing/stadiums/saltlakestadium.jpg'),
  'stadiums/saltlakestadium': require('@/assets/images/landing/stadiums/saltlakestadium.jpg'),
  'instadium/stadiums/saltlakestadium': require('@/assets/images/landing/stadiums/saltlakestadium.jpg'),
  dypatilstadium: require('@/assets/images/landing/stadiums/other/dypatilstadium.jpg'),
  'stadiums/other/dypatilstadium': require('@/assets/images/landing/stadiums/other/dypatilstadium.jpg'),
  'instadium/stadiums/other/dypatilstadium': require('@/assets/images/landing/stadiums/other/dypatilstadium.jpg'),
  chinnaswamystadium: require('@/assets/images/landing/stadiums/other/chinnaswamystadium.jpg'),
  'stadiums/other/chinnaswamystadium': require('@/assets/images/landing/stadiums/other/chinnaswamystadium.jpg'),
  'instadium/stadiums/other/chinnaswamystadium': require('@/assets/images/landing/stadiums/other/chinnaswamystadium.jpg'),
};

const fallbackDefaultImage = require('@/assets/images/landing/stadium.jpg');

function getCloudinaryCloudName() {
  return process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
}

function stripExt(value: string) {
  return value.replace(/\.(png|jpg|jpeg|webp|avif)$/i, '');
}

function toPublicIdFromPath(value: string) {
  const noQuery = value.split('?')[0] || value;
  if (noQuery.startsWith('/images/')) {
    const withoutRoot = noQuery.replace(/^\/images\//, '');
    return `instadium/${stripExt(withoutRoot).toLowerCase()}`;
  }
  const parts = noQuery.split('/').filter(Boolean);
  const fileName = parts[parts.length - 1] || noQuery;
  return stripExt(fileName).toLowerCase();
}

function getCloudinaryUrl(publicId: string, options: { width?: number; height?: number; crop?: string } = {}) {
  const cloudName = getCloudinaryCloudName();
  if (!cloudName || !publicId) {
    return null;
  }

  const transformations: string[] = [];
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  transformations.push('f_auto');
  transformations.push('q_auto');

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations.join(',')}/${publicId}`;
}

export function getSportIconByName(name: string) {
  const key = (name || '').trim().toLowerCase();
  return sportIconMap[key] || sportIconMap.cricket;
}

export function getLocalStadiumImage(image?: string) {
  if (!image) {
    return fallbackDefaultImage;
  }

  const value = String(image);

  if (value.startsWith('http')) {
    return value;
  }

  const publicId = toPublicIdFromPath(value);
  const cloudinaryUrl = getCloudinaryUrl(publicId);
  if (cloudinaryUrl) {
    return cloudinaryUrl;
  }

  const mapped = fallbackByPublicId[publicId];
  if (mapped) {
    return mapped;
  }

  const basename = publicId.split('/').pop() || publicId;
  const mappedByBasename = fallbackByPublicId[basename];
  if (mappedByBasename) {
    return mappedByBasename;
  }

  switch (image) {
    case 'wankhedestadium':
      return require('@/assets/images/landing/stadiums/wankhedestadium.jpg');
    case 'narendramodistadium':
      return require('@/assets/images/landing/stadiums/narendramodistadium.jpg');
    case 'saltlakestadium':
      return require('@/assets/images/landing/stadiums/saltlakestadium.jpg');
    default:
      return fallbackDefaultImage;
  }
}

export function resolveStadiumImage(stadium: any) {
  // 1. If the API gave us actual gallery URLs, use them
  if (Array.isArray(stadium.galleryImages) && stadium.galleryImages.length > 0) {
    const first = stadium.galleryImages[0];
    let url: string | undefined;

    if (typeof first === 'string') {
      url = first;
    } else if (first && typeof first === 'object' && typeof first.url === 'string') {
      url = first.url;
    }

    if (url) return getLocalStadiumImage(url);
  }

  // 2. Match by exact API stadium ID (most reliable)
  const id = (stadium.id || '').toLowerCase();
  if (id === 'narendra-modi-stadium' || id === 'narendramodistadium') {
    return require('@/assets/images/landing/stadiums/narendramodistadium.jpg');
  }
  if (id === 'wankhede-stadium' || id === 'wankhedestadium') {
    return require('@/assets/images/landing/stadiums/wankhedestadium.jpg');
  }
  if (id === 'salt-lake-stadium' || id === 'saltlakestadium') {
    return require('@/assets/images/landing/stadiums/saltlakestadium.jpg');
  }
  if (id === 'm-chinnaswamy-stadium' || id === 'mchinnaswamystadium') {
    return require('@/assets/images/landing/stadiums/other/chinnaswamystadium.jpg');
  }
  if (id.includes('patil') || id.includes('dy-patil')) {
    return require('@/assets/images/landing/stadiums/other/dypatilstadium.jpg');
  }

  // 3. Fuzzy name match as last resort
  const name = (stadium.name || '').toLowerCase().replace(/[^a-z]/g, '');
  if (name.includes('wankhede')) return require('@/assets/images/landing/stadiums/wankhedestadium.jpg');
  if (name.includes('modi')) return require('@/assets/images/landing/stadiums/narendramodistadium.jpg');
  if (name.includes('saltlake') || name.includes('saltsalt')) return require('@/assets/images/landing/stadiums/saltlakestadium.jpg');
  if (name.includes('chinnaswamy')) return require('@/assets/images/landing/stadiums/other/chinnaswamystadium.jpg');
  if (name.includes('patil')) return require('@/assets/images/landing/stadiums/other/dypatilstadium.jpg');

  return fallbackDefaultImage;
}
