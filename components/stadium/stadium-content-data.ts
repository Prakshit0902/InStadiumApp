import { GalleryImage, MatchItem, NearbyPlace, TimelineItem } from './types';

export type StadiumLocalContent = {
  description: string;
  latitude: number;
  longitude: number;
  historyTimeline: TimelineItem[];
  upcomingMatches: MatchItem[];
  nearbyPlaces: NearbyPlace[];
  galleryImages: GalleryImage[];
};

const STADIUM_CONTENT: Record<string, StadiumLocalContent> = {
  'narendra-modi-stadium': {
    description: `The Narendra Modi Stadium in Ahmedabad is the largest cricket stadium in the world, with a seating capacity of 132,000 spectators. Built in 1982 and extensively redeveloped between 2015 and 2020, the stadium stands as a testament to India's sporting ambition. It hosted the iconic Pink-ball Test between India and England in 2021 and the ICC Men's T20 World Cup Final in 2024. The stadium's horseshoe-shaped layout and state-of-the-art facilities make it a crown jewel of world cricket.`,
    latitude: 23.0900,
    longitude: 72.5952,
    historyTimeline: [
      {
        year: '1982',
        event: 'Sardar Patel Stadium Inaugurated',
        description: `The original Sardar Patel Stadium was built and hosted its first Ranji Trophy matches, marking Ahmedabad's entry onto the national cricket map.`,
      },
      {
        year: '1987',
        event: 'First ODI International',
        description: `The stadium hosted its first international One Day match during the Reliance World Cup, cementing Ahmedabad as a premier cricketing destination.`,
      },
      {
        year: '2000',
        event: 'Hosting the Wills Trophy',
        description: `The venue saw India defeat South Africa in a memorable ODI series, with packed stands of nearly 49,000 fans cheering their heroes.`,
      },
      {
        year: '2015',
        event: 'Redevelopment Commences',
        description: `A comprehensive redevelopment plan was announced by BCCI and the Gujarat Cricket Association, aiming to transform the stadium into a world-class facility.`,
      },
      {
        year: '2020',
        event: 'Renamed & Reconstructed',
        description: `Renamed the Narendra Modi Stadium after a multi-year, Rs. 700 crore reconstruction. The new venue raised capacity to 1,32,000 — the largest cricket ground in the world.`,
      },
      {
        year: '2021',
        event: 'Historic Day-Night Test',
        description: `India vs England Day-Night Pink Ball Test attracted over 1,00,000 fans, creating an electrifying atmosphere that became iconic in cricketing history.`,
      },
      {
        year: '2023',
        event: 'ICC World Cup Final',
        description: `The stadium hosted the ICC Men's Cricket World Cup Final between India and Australia, a momentous occasion broadcast to billions across the globe.`,
      },
      {
        year: '2024',
        event: 'ICC T20 World Cup Final',
        description: `Narendra Modi Stadium hosted the T20 World Cup Final, welcoming cricket fans from around the world to witness India lift the trophy on home soil.`,
      },
    ],
    upcomingMatches: [
      {
        teams: 'India vs England',
        date: '2026-09-14',
        tournament: 'ICC Champions Trophy — Warm-up',
      },
      {
        teams: 'Gujarat Titans vs Mumbai Indians',
        date: '2026-04-28',
        tournament: 'Indian Premier League 2026',
      },
      {
        teams: 'India vs South Africa',
        date: '2026-10-02',
        tournament: 'Bilateral ODI Series',
      },
    ],
    nearbyPlaces: [
      { name: 'Sardar Vallabhbhai Patel International Airport', distance: '13.4 km', type: 'Airport' },
      { name: 'Ahmedabad Railway Station', distance: '11.2 km', type: 'Transit' },
      { name: 'Motera Metro Station', distance: '0.8 km', type: 'Transit' },
      { name: 'Vastrapur Lake', distance: '8.6 km', type: 'Leisure' },
      { name: 'Sabarmati Riverfront', distance: '10.1 km', type: 'Tourism' },
      { name: 'Kankaria Lake', distance: '6.3 km', type: 'Leisure' },
      { name: 'Science City Ahmedabad', distance: '7.1 km', type: 'Tourism' },
    ],
    galleryImages: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Narendra_Modi_Stadium%2C_Motera%2C_Ahmedabad.jpg/1600px-Narendra_Modi_Stadium%2C_Motera%2C_Ahmedabad.jpg', caption: 'Aerial view of the stadium' },
      { url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80', caption: 'Floodlit night atmosphere' },
    ],
  },

  'wankhede-stadium': {
    description: `The Wankhede Stadium in Mumbai is one of cricket's most storied venues, located in the heart of South Mumbai near Marine Drive. Named after S. K. Wankhede, it has a capacity of 33,108 and has been host to legendary moments — most memorably the 2011 ICC Cricket World Cup Final, when MS Dhoni hit the winning six to seal India's second World Cup triumph in front of a delirious home crowd. With its intimate stands and electric atmosphere, Wankhede is universally regarded as the cathedral of Indian cricket.`,
    latitude: 18.9388,
    longitude: 72.8258,
    historyTimeline: [
      {
        year: '1974',
        event: 'Stadium Opens',
        description: `Wankhede Stadium opened its gates with the West Indies tour of India, replacing the Brabourne Stadium as Mumbai's premier cricket venue.`,
      },
      {
        year: '1975',
        event: 'First Test Match',
        description: `India hosted the West Indies in the first official Test at Wankhede, setting the stage for decades of legendary cricket.`,
      },
      {
        year: '1987',
        event: 'World Cup Venue',
        description: `Wankhede hosted the 1987 Cricket World Cup matches, bringing global attention to Mumbai and showcasing India's growing cricketing stature.`,
      },
      {
        year: '2008',
        event: 'Mumbai Indians IPL Franchise',
        description: `The Mumbai Indians franchise was established, making Wankhede the spiritual home of one of the IPL's most successful franchises with a passionate fanbase.`,
      },
      {
        year: '2009',
        event: 'Full Redevelopment',
        description: `The stadium underwent a complete reconstruction for the 2011 World Cup, with modern stands and facilities replacing the original structures.`,
      },
      {
        year: '2011',
        event: 'World Cup Final — India Wins',
        description: `In the most iconic moment in Indian cricket history, MS Dhoni hit the winning six as India defeated Sri Lanka to win the ICC Cricket World Cup in front of 33,000 euphoric fans.`,
      },
      {
        year: '2016',
        event: 'T20 World Cup Semi-Final',
        description: `Wankhede hosted the ICC T20 World Cup semi-final clash between India and the West Indies, a pulsating contest watched by fans worldwide.`,
      },
      {
        year: '2023',
        event: 'IPL Season Milestone',
        description: `Mumbai Indians celebrated a landmark IPL victory, with Wankhede lighting up in blue as confetti rained down on their beloved home ground.`,
      },
    ],
    upcomingMatches: [
      {
        teams: 'Mumbai Indians vs Royal Challengers',
        date: '2026-04-19',
        tournament: 'Indian Premier League 2026',
      },
      {
        teams: 'India vs New Zealand',
        date: '2026-08-22',
        tournament: 'Bilateral T20I Series',
      },
      {
        teams: 'Mumbai vs Karnataka',
        date: '2026-11-10',
        tournament: 'Ranji Trophy 2026-27',
      },
    ],
    nearbyPlaces: [
      { name: 'Churchgate Railway Station', distance: '0.6 km', type: 'Transit' },
      { name: 'Marine Drive', distance: '0.9 km', type: 'Tourism' },
      { name: 'Chhatrapati Shivaji Maharaj International Airport', distance: '26.5 km', type: 'Airport' },
      { name: 'Marine Lines Metro Station', distance: '1.1 km', type: 'Transit' },
      { name: 'Nariman Point', distance: '1.8 km', type: 'Business' },
      { name: 'Colaba Causeway', distance: '3.2 km', type: 'Shopping' },
      { name: 'Gateway of India', distance: '3.9 km', type: 'Tourism' },
    ],
    galleryImages: [
      { url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80', caption: 'Match day atmosphere' },
      { url: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&q=80', caption: 'Evening lights' },
    ],
  },

  'salt-lake-stadium': {
    description: `Vivekananda Yuba Bharati Krirangan — popularly known as Salt Lake Stadium — is one of the largest football stadiums in the world, located in Bidhannagar, Kolkata. With a seating capacity of 85,000, it stands as the spiritual home of Indian football and the beloved East Bengal and Mohun Bagan clubs, whose rivalry is among the most passionate in global sport. Built in 1984, the stadium has hosted AFC Cup finals, the FIFA U-17 World Cup, and countless electrifying Kolkata Derby matches.`,
    latitude: 22.5782,
    longitude: 88.4006,
    historyTimeline: [
      {
        year: '1984',
        event: 'Stadium Inaugurated',
        description: `Vivekananda Yuba Bharati Krirangan was inaugurated by Chief Minister Jyoti Basu, with an initial capacity of 1,20,000 making it the largest stadium in Asia at the time.`,
      },
      {
        year: '1997',
        event: 'First International Football',
        description: `India hosted an international Nehru Cup fixture at Salt Lake, with a packed house of over 1,00,000 fans creating an unforgettable atmosphere.`,
      },
      {
        year: '2007',
        event: 'AFC Cup Final',
        description: `Dempo SC played in the AFC Cup final at Salt Lake, bringing continental club football excitement to Kolkata's passionate football community.`,
      },
      {
        year: '2017',
        event: 'FIFA U-17 World Cup',
        description: `Salt Lake Stadium hosted multiple matches of the FIFA Under-17 World Cup held in India, bringing global youth football stars to Kolkata.`,
      },
      {
        year: '2019',
        event: 'Renovation Completed',
        description: `A comprehensive renovation reduced capacity to 85,000 seats while upgrading facilities, improving sightlines, and installing modern scoreboards and floodlights.`,
      },
      {
        year: '2022',
        event: 'Durand Cup Final',
        description: `The 131st edition of the historic Durand Cup returned to Salt Lake, with East Bengal defeating Mohun Bagan in a derby final before a roaring 80,000-strong crowd.`,
      },
      {
        year: '2023',
        event: 'SAFF Championship Host',
        description: `Salt Lake Stadium hosted the SAFF Championship, cementing Kolkata's reputation as the football capital of India.`,
      },
    ],
    upcomingMatches: [
      {
        teams: 'East Bengal vs Mohun Bagan',
        date: '2026-05-03',
        tournament: 'Kolkata Derby — Indian Super League 2026',
      },
      {
        teams: 'India vs Myanmar',
        date: '2026-06-10',
        tournament: 'FIFA World Cup Qualifier',
      },
      {
        teams: 'Mohun Bagan vs NorthEast United',
        date: '2026-04-26',
        tournament: 'Indian Super League 2026',
      },
    ],
    nearbyPlaces: [
      { name: 'Netaji Subhas Chandra Bose International Airport', distance: '18.5 km', type: 'Airport' },
      { name: 'Salt Lake Sector V Metro Station', distance: '2.3 km', type: 'Transit' },
      { name: 'City Centre Saltlake', distance: '3.1 km', type: 'Shopping' },
      { name: 'Eco Park', distance: '6.7 km', type: 'Leisure' },
      { name: 'Nicco Park', distance: '3.4 km', type: 'Leisure' },
      { name: 'Science City Kolkata', distance: '5.9 km', type: 'Tourism' },
      { name: 'New Town Rajarhat', distance: '8.2 km', type: 'Business' },
    ],
    galleryImages: [
      { url: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80', caption: 'Stadium panorama' },
      { url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80', caption: 'Match day crowd' },
    ],
  },

  'm-chinnaswamy-stadium': {
    description: `M. Chinnaswamy Stadium, nestled in the heart of Bengaluru, is one of India's most iconic and atmospheric cricket venues. Named after M. Chinnaswamy, a BCCI president and lifelong cricket administrator, the stadium holds 38,000 fans and is famed for its electric pitch conditions that have produced some of cricket's highest-scoring games. Home to the Royal Challengers Bengaluru in the IPL, the ground's stands are perpetually drenched in a sea of red and gold. The fan energy here is legendary even by Indian cricket standards.`,
    latitude: 12.9794,
    longitude: 77.5996,
    historyTimeline: [
      {
        year: '1969',
        event: 'Stadium Established',
        description: `M. Chinnaswamy Stadium was founded by the Karnataka State Cricket Association to give Bengaluru a dedicated international cricket venue.`,
      },
      {
        year: '1974',
        event: 'First Test Match',
        description: `India hosted West Indies in the first Test at Chinnaswamy, a historic occasion attended by thousands of passionate Bengaluru cricket fans.`,
      },
      {
        year: '1987',
        event: 'Reliance World Cup Match',
        description: `The stadium hosted the 1987 World Cup league match between India and Zimbabwe, introducing Bengaluru to the global cricket stage.`,
      },
      {
        year: '1996',
        event: 'Wills World Cup Quarter-Final',
        description: `India beat Pakistan in a high-voltage quarter-final at Chinnaswamy, one of the most watched India-Pakistan cricket encounters of the era.`,
      },
      {
        year: '2008',
        event: 'Home of RCB in IPL',
        description: `Royal Challengers Bengaluru adopted Chinnaswamy as their home ground for the inaugural IPL season, beginning a passionate relationship with the city's cricket fans.`,
      },
      {
        year: '2016',
        event: 'Record IPL Score at Chinnaswamy',
        description: `Royal Challengers Bengaluru set the IPL record score of 263/5 at Chinnaswamy against Pune Supergiants, with Chris Gayle and AB de Villiers putting on an unforgettable batting masterclass.`,
      },
      {
        year: '2023',
        event: 'Solar-Powered Stadium',
        description: `Chinnaswamy became India's first solar-powered cricket stadium, installing 400kW of solar panels in a landmark step towards sustainable sports infrastructure.`,
      },
    ],
    upcomingMatches: [
      {
        teams: 'Royal Challengers Bengaluru vs Delhi Capitals',
        date: '2026-04-22',
        tournament: 'Indian Premier League 2026',
      },
      {
        teams: 'India vs West Indies',
        date: '2026-07-15',
        tournament: 'Bilateral T20I Series',
      },
      {
        teams: 'Karnataka vs Tamil Nadu',
        date: '2026-11-20',
        tournament: 'Ranji Trophy 2026-27',
      },
    ],
    nearbyPlaces: [
      { name: 'Kempegowda International Airport', distance: '34.2 km', type: 'Airport' },
      { name: 'Cubbon Park Metro Station', distance: '0.7 km', type: 'Transit' },
      { name: 'Cubbon Park', distance: '0.9 km', type: 'Leisure' },
      { name: 'MG Road', distance: '1.4 km', type: 'Shopping' },
      { name: 'Vidhana Soudha', distance: '1.1 km', type: 'Tourism' },
      { name: 'Brigade Road', distance: '1.6 km', type: 'Shopping' },
      { name: 'Ulsoor Lake', distance: '2.9 km', type: 'Leisure' },
    ],
    galleryImages: [
      { url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80', caption: 'Inside view of Chinnaswamy' },
      { url: 'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=800&q=80', caption: 'RCB matchnight' },
    ],
  },
};

/**
 * Merges live API stadium data with rich locally-curated content.
 * Fields from the API take priority if they are non-null / non-empty.
 */
export function mergeWithLocalContent(apiStadium: any): any {
  const local = STADIUM_CONTENT[apiStadium.id];
  if (!local) return apiStadium;

  return {
    ...apiStadium,
    description: apiStadium.description || local.description,
    latitude: apiStadium.latitude ?? local.latitude,
    longitude: apiStadium.longitude ?? local.longitude,
    historyTimeline:
      apiStadium.historyTimeline != null
        ? apiStadium.historyTimeline
        : local.historyTimeline,
    upcomingMatches:
      apiStadium.upcomingMatches != null
        ? apiStadium.upcomingMatches
        : local.upcomingMatches,
    nearbyPlaces:
      apiStadium.nearbyPlaces != null
        ? apiStadium.nearbyPlaces
        : local.nearbyPlaces,
    galleryImages:
      Array.isArray(apiStadium.galleryImages) && apiStadium.galleryImages.length > 0
        ? apiStadium.galleryImages
        : local.galleryImages,
  };
}
