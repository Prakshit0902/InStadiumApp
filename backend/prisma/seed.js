import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set in .env.local');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Resetting database...');
  // Delete in correct order to respect foreign key constraints
  await prisma.qRMapping.deleteMany();
  await prisma.player.deleteMany();
  await prisma.stadium.deleteMany();
  await prisma.sport.deleteMany();

  console.log('Seeding sports...');

  const sports = {
    cricket: { id: 'cricket', name: 'Cricket', description: 'Popular sport in India', icon: 'Trophy' },
    football: { id: 'football', name: 'Football', description: 'Popular sport in India', icon: 'Activity' },
    hockey: { id: 'hockey', name: 'Hockey', description: 'National sport legacy', icon: 'Award' },
    badminton: { id: 'badminton', name: 'Badminton', description: 'Court dominance', icon: 'Star' },
    tennis: { id: 'tennis', name: 'Tennis', description: 'Tennis legacy', icon: 'Target' },
  };

  for (const sport of Object.values(sports)) {
    await prisma.sport.upsert({
      where: { id: sport.id },
      update: {},
      create: sport,
    });
  }

  const stadiumData = [
    {
      id: 'wankhede-stadium',
      name: 'Wankhede Stadium',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      capacity: 33000,
      builtYear: 1974,
      description: 'The spiritual home of Indian cricket.',
      sportsPlayed: { connect: [{ id: 'cricket' }] },
    },
    {
      id: 'm-chinnaswamy-stadium',
      name: 'M. Chinnaswamy Stadium',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      capacity: 40000,
      builtYear: 1969,
      description: 'Known for its electrifying atmosphere and high-scoring matches.',
      sportsPlayed: { connect: [{ id: 'cricket' }] },
    },
    {
      id: 'narendra-modi-stadium',
      name: 'Narendra Modi Stadium',
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
      capacity: 132000,
      builtYear: 1982,
      description: 'The largest cricket stadium in the world.',
      sportsPlayed: { connect: [{ id: 'cricket' }] },
    },
    {
      id: 'salt-lake-stadium',
      name: 'Salt Lake Stadium',
      city: 'Kolkata',
      state: 'West Bengal',
      country: 'India',
      capacity: 85000,
      builtYear: 1984,
      description: 'A legendary venue for Indian football.',
      sportsPlayed: { connect: [{ id: 'football' }] },
    }
  ];

  for (const stadium of stadiumData) {
    await prisma.stadium.upsert({
      where: { id: stadium.id },
      update: stadium,
      create: stadium,
    });
  }

  const players = [
    {
      id: 'virat-kohli',
      name: 'Virat Kohli',
      sportId: 'cricket',
      country: 'India',
      image: 'https://res.cloudinary.com/daud2uqqf/image/upload/v1775901628/viratkohli_g7tzsx.png',
      bio: "One of the greatest batsmen in modern cricket, known for his incredible run-chasing ability and intense competitive spirit.",
      achievements: ['ICC Player of the Decade', 'Most ODI centuries'],
      stats: [
        { label: 'International Runs', value: '26,000+' },
        { label: 'Centuries', value: '80+' }
      ],
      stadiumsPlayed: { connect: [{ id: 'm-chinnaswamy-stadium' }, { id: 'wankhede-stadium' }] }
    },
    {
      id: 'sachin-tendulkar',
      name: 'Sachin Tendulkar',
      sportId: 'cricket',
      country: 'India',
      image: 'https://res.cloudinary.com/daud2uqqf/image/upload/v1775901627/sachintendulkar_arvchm.jpg',
      bio: "Widely regarded as the greatest batsman in the history of cricket. The 'Master Blaster' redefined batting excellence.",
      achievements: ['Bharat Ratna', '100 International Centuries'],
      stats: [
        { label: 'International Runs', value: '34,357' },
        { label: 'Centuries', value: '100' }
      ],
      stadiumsPlayed: { connect: [{ id: 'wankhede-stadium' }] }
    },
    {
      id: 'sunil-chhetri',
      name: 'Sunil Chhetri',
      sportId: 'football',
      country: 'India',
      image: 'https://res.cloudinary.com/daud2uqqf/image/upload/v1775901628/sunilchhetri_ezdhww.jpg',
      bio: "India's greatest football captain and leading goalscorer, ranking among the world's top active international scorers.",
      achievements: ['Major Dhyan Chand Khel Ratna', 'Most capped Indian player'],
      stats: [
        { label: 'International Goals', value: '94' },
        { label: 'Appearances', value: '150+' }
      ],
      stadiumsPlayed: { connect: [{ id: 'salt-lake-stadium' }] }
    },
    {
      id: 'sunil-gavaskar',
      name: 'Sunil Gavaskar',
      sportId: 'cricket',
      country: 'India',
      image: 'https://res.cloudinary.com/daud2uqqf/image/upload/v1775901627/sunilgavaskar_oqig8j.jpg',
      bio: "The legendary opening batsman who held the record for most Test centuries for over two decades.",
      achievements: ['World Cup Winner 1983', 'Padma Bhushan'],
      stats: [
        { label: 'Test Runs', value: '10,122' },
        { label: 'Test Centuries', value: '34' }
      ],
      stadiumsPlayed: { connect: [{ id: 'wankhede-stadium' }] }
    },
    {
      id: 'leander-paes',
      name: 'Leander Paes',
      sportId: 'tennis',
      country: 'India',
      image: 'https://res.cloudinary.com/daud2uqqf/image/upload/v1775901627/leanderpaes_d3dpjp.png',
      bio: "One of the greatest doubles players in tennis history, with numerous Grand Slam titles and an Olympic medal.",
      achievements: ['18 Grand Slam Titles', 'Olympic Bronze 1996'],
      stats: [
        { label: 'Doubles Titles', value: '50+' },
        { label: 'Weeks at No. 1', value: 'Multiple' }
      ]
    },
    {
      id: 'manpreet-singh',
      name: 'Manpreet Singh',
      sportId: 'hockey',
      country: 'India',
      image: 'https://res.cloudinary.com/daud2uqqf/image/upload/v1775901627/manpreetsingh_modxsl.jpg',
      bio: "The mid-field engine and captain who led India to its first Olympic hockey medal in 41 years at Tokyo 2020.",
      achievements: ['Olympic Bronze 2020', 'FIH Player of the Year 2019'],
      stats: [
        { label: 'International Caps', value: '300+' },
        { label: 'Olympic Medals', value: '1' }
      ]
    },
    {
      id: 'rahul-dravid',
      name: 'Rahul Dravid',
      sportId: 'cricket',
      country: 'India',
      image: 'https://res.cloudinary.com/daud2uqqf/image/upload/v1775901627/rahuldravid_gdz7fe.jpg',
      bio: "Known as 'The Wall', Dravid was the backbone of the Indian batting lineup and is one of the most respected figures in cricket.",
      achievements: ['ICC Hall of Fame', 'Over 13,000 Test Runs'],
      stats: [
        { label: 'Test Runs', value: '13,288' },
        { label: 'Test Average', value: '52.31' }
      ],
      stadiumsPlayed: { connect: [{ id: 'wankhede-stadium' }] }
    },
    {
      id: 'hardik-pandya',
      name: 'Hardik Pandya',
      sportId: 'cricket',
      country: 'India',
      image: 'https://res.cloudinary.com/daud2uqqf/image/upload/v1775901627/hardikpandya_qe9qmy.jpg',
      bio: "A dynamic all-rounder who provides balance and power to the Indian team in limited-overs formats.",
      achievements: ['IPL Champion Captain', 'T20 World Cup Winner'],
      stats: [
        { label: 'ODI Strike Rate', value: '110+' },
        { label: 'T20 Strike Rate', value: '140+' }
      ],
      stadiumsPlayed: { connect: [{ id: 'wankhede-stadium' }] }
    },
    {
      id: 'pv-sindhu',
      name: 'PV Sindhu',
      sportId: 'badminton',
      country: 'India',
      image: 'https://res.cloudinary.com/daud2uqqf/image/upload/v1775901627/pvsindhu_tkgxro.jpg',
      bio: "India's most successful badminton player, winning two consecutive Olympic medals and a World Championship gold.",
      achievements: ['Olympic Silver 2016', 'Olympic Bronze 2020', 'World Champion 2019'],
      stats: [
        { label: 'World Medals', value: '5' },
        { label: 'BWF Titles', value: '15+' }
      ]
    },
    {
      id: 'saina-nehwal',
      name: 'Saina Nehwal',
      sportId: 'badminton',
      country: 'India',
      image: 'https://res.cloudinary.com/daud2uqqf/image/upload/v1775901627/sainanehwal_o7qxsm.jpg',
      bio: "The trailblazer of Indian badminton and the first Indian to win an Olympic medal in sport.",
      achievements: ['Olympic Bronze 2012', 'Former World No. 1'],
      stats: [
        { label: 'BWF Titles', value: '20+' },
        { label: 'Olympic Medals', value: '1' }
      ]
    }
  ];

  for (const player of players) {
    await prisma.player.upsert({
      where: { id: player.id },
      update: player,
      create: player,
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
