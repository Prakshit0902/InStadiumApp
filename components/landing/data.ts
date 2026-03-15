import { NearbyStadium, SportItem, Stadium } from './types';

export const sports: SportItem[] = [
  { name: 'Cricket', icon: require('@/assets/images/landing/sportsIcon/cricket.png') },
  { name: 'Football', icon: require('@/assets/images/landing/sportsIcon/football.png') },
  { name: 'Kabaddi', icon: require('@/assets/images/landing/sportsIcon/kabaddi.png') },
  { name: 'Badminton', icon: require('@/assets/images/landing/sportsIcon/badminton.png') },
  { name: 'Tennis', icon: require('@/assets/images/landing/sportsIcon/tennis.png') },
  { name: 'Hockey', icon: require('@/assets/images/landing/sportsIcon/hockey.png') },
];

export const nearbyStadiums: NearbyStadium[] = [
  {
    id: 'dy-patil-stadium',
    name: 'DY Patil Stadium',
    city: 'Navi Mumbai',
    distance: '12.5 km',
    image: require('@/assets/images/landing/stadiums/other/dypatilstadium.jpg'),
  },
  {
    id: 'm-chinnaswamy-stadium',
    name: 'M. Chinnaswamy Stadium',
    city: 'Bengaluru',
    distance: '4.2 km',
    image: require('@/assets/images/landing/stadiums/other/chinnaswamystadium.jpg'),
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

export function getLocalStadiumImage(image?: string) {
  switch (image) {
    case 'wankhedestadium':
      return require('@/assets/images/landing/stadiums/wankhedestadium.jpg');
    case 'narendramodistadium':
      return require('@/assets/images/landing/stadiums/narendramodistadium.jpg');
    case 'saltlakestadium':
      return require('@/assets/images/landing/stadiums/saltlakestadium.jpg');
    default:
      return require('@/assets/images/landing/stadium.jpg');
  }
}
