export type SportRule = {
  title: string;
  content: string;
};

export type SportTimelineEvent = {
  year: string;
  event: string;
  description?: string;
};

export type SportMetadata = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  tags: string[];
  history: SportTimelineEvent[];
  rulebook: SportRule[];
};

export const SPORTS_HUB_DATA: Record<string, { description: string; rulebook: SportRule[] }> = {
  Cricket: {
    description:
      "Known as the 'Gentleman's Game', cricket is a multi-format sport with a rich heritage in India. From the traditional Test matches to the high-octane T20 IPL, it's more than just a sport; it's an emotion.",
    rulebook: [
      {
        title: 'The Pitch',
        content:
          "A central 22-yard strip where the main action happens. It's carefully curated to influence the ball's movement-some favor fast bowlers with bounce, while others assist spinners as the match progresses.",
      },
      {
        title: 'The Over',
        content:
          'A set of six legal deliveries bowled by a single player from one end of the pitch. After an over, the bowling end changes, and a different player takes over, ensuring a strategic rotation of pace and guile.',
      },
      {
        title: 'Wickets',
        content:
          'The primary objective for bowlers. There are 10 ways to get a batsman out, including being bowled (hitting the stumps), caught, Leg Before Wicket (LBW), or run out while trying to complete a run.',
      },
      {
        title: 'Scoring Runs',
        content:
          'Batsmen score runs by hitting the ball and running between the wickets. Hitting the ball to the boundary scores 4 runs, while clearing the rope on the full earns a maximum of 6 runs.',
      },
    ],
  },
  Football: {
    description:
      "The world's most popular sport, football is a game of skill, strategy, and endurance. In India, it's witnessing a massive resurgence with the Indian Super League and a growing grassroots movement.",
    rulebook: [
      {
        title: 'The Goal',
        content:
          "The main objective is to drive the ball into the opponent's net. A goal is scored when the entire ball crosses the goal line between the posts and under the crossbar.",
      },
      {
        title: 'Fouls & Cards',
        content:
          'Physical contact is regulated. Reckless play or unsporting behavior results in a Yellow Card (warning) or a Red Card (ejection). Professional fouls can lead to direct free kicks or penalties.',
      },
      {
        title: 'Offside Rule',
        content:
          "A strategic rule preventing 'goal-hanging'. An attacking player must have at least two opponents (usually the keeper and one defender) between them and the goal line when the ball is played to them.",
      },
      {
        title: 'Corner Kicks',
        content:
          "Awarded when the defending team is the last to touch the ball before it crosses their own goal line (excluding goals). It's a prime opportunity for set-piece specialists to create scoring chances.",
      },
    ],
  },
  Kabaddi: {
    description:
      "An ancient Indian contact sport that requires agility, lung capacity, and immense strength. It's a thrilling 40-minute battle where individual brilliance meets collective defensive strategy.",
    rulebook: [
      {
        title: 'The Raid',
        content:
          "An individual attacker (Raider) enters the opponent's half, chanting 'Kabaddi' without breaking their breath. They must touch at least one defender and return to their own half safely.",
      },
      {
        title: 'Touch & Tag',
        content:
          "Points are scored for every defender the raider touches before returning. Defenders are 'out' and must leave the mat until a teammate scores a point to revive them.",
      },
      {
        title: 'The Tackle',
        content:
          'Defenders (Antis) work together to trap the raider and prevent them from reaching the midline. A successful tackle earns the defending team a point and revives one of their own players.',
      },
      {
        title: 'Bonus Point',
        content:
          "A raider can earn an extra point by crossing the 'Bonus Line' when there are 6 or 7 defenders active on the mat, even if they don't touch any opponent.",
      },
    ],
  },
  Badminton: {
    description:
      "A fast-paced racket sport requiring lightning-fast reflexes and delicate touch. India has emerged as a global superpower in badminton, with numerous Olympic and World Championship medals.",
    rulebook: [
      {
        title: 'The Serve',
        content:
          "Must be delivered underhand and diagonally into the opponent's service court. In professional play, the shuttle must be hit from below the server's waist height.",
      },
      {
        title: 'Rally Scoring',
        content:
          'A point is won on every serve, regardless of who is serving. Matches are usually best of three games, with each game played to 21 points (must lead by 2, capped at 30).',
      },
      {
        title: 'Let',
        content:
          'A call made by the umpire to halt play when an unforeseen accident or distraction occurs. The point is replayed, and no change is made to the score or service order.',
      },
      {
        title: 'Faults',
        content:
          'Includes the shuttle landing outside boundaries, failing to pass over the net, touching the net with the racket or body, or being hit twice by the same player/team.',
      },
    ],
  },
  Tennis: {
    description:
      "The epitome of individual sporting excellence played on various surfaces. From clay courts to grass, tennis in India has a legacy of producing world-class doubles specialists.",
    rulebook: [
      {
        title: 'Game/Set/Match',
        content:
          "The scoring hierarchy. Four points win a game (15, 30, 40, Game), six games win a set, and two or three sets win the match. 'Deuce' occurs at 40-40, requiring a two-point lead.",
      },
      {
        title: 'The Serve',
        content:
          "Starting the point from behind the baseline. If it hits the net but lands in the correct service box, it's a 'Let' (replay). Missing twice results in a Double Fault and loss of the point.",
      },
      {
        title: 'The Deuce',
        content:
          "A Tie at 40-all. A player must win two consecutive points (Advantage and then Game Point) to win the game. This creates the most high-pressure moments in the sport.",
      },
      {
        title: 'Baseline Play',
        content:
          'The strategic exchange of groundstrokes from the back of the court. Players use topspin, slice, and varying depths to outmaneuver opponents and create winning opportunities.',
      },
    ],
  },
  Hockey: {
    description:
      "India's national glory sport with a legendary history of 8 Olympic Gold medals. Modern field hockey is a high-intensity game played on synthetic turf at breakneck speeds.",
    rulebook: [
      {
        title: 'Penalty Corner',
        content:
          "The most vital set-piece, awarded for defensive fouls inside the circle. The ball is pushed from the baseline to the top of the 'D', followed by a high-speed drag-flick or hit toward the goal.",
      },
      {
        title: 'The Cards',
        content:
          'Disciplinary actions: Green Card (2-minute suspension), Yellow Card (minimum 5-minute suspension), and Red Card (permanent removal from the match).',
      },
      {
        title: 'No-Feet Rule',
        content:
          'Only the goalkeeper (within the circle) can use their body or feet to stop the ball. For outfield players, any contact between the ball and feet is a foul, often resulting in a change of possession.',
      },
      {
        title: 'Dangerous Play',
        content:
          "Refers to lifting the ball into players or hitting it wildly. High balls must be controlled correctly, and 'sticks' (lifting the stick above head height) is restricted for safety.",
      },
    ],
  },
};

export const ADDITIONAL_SPORTS_DATA: Record<string, SportMetadata> = {
  cricket: {
    id: 'cricket',
    name: 'Cricket',
    description: 'The heartbeat of India, a game of strategy and tradition.',
    longDescription:
      "Cricket is more than just a sport in India; it's a parallel religion that unites billions. From the historical origins in the colonial era to the modern-day T20 revolution, cricket has shaped the nation's sporting identity like no other.",
    tags: ["Gentleman's Game", 'National Passion', 'World Cup Glory'],
    history: [
      { year: '1721', event: 'First Match in India', description: 'British sailors played the first recorded cricket match in Cambay.' },
      { year: '1848', event: 'Oriental Cricket Club', description: 'The Parsi community founded the first Indian cricket club in Mumbai.' },
      { year: '1932', event: 'Test Debut', description: "India played its first Test match against England at Lord's." },
      { year: '1983', event: 'World Cup Victory', description: "Kapil Dev led India to its first-ever World Cup triumph at Lord's." },
      { year: '2011', event: 'World Cup Glory at Home', description: "MS Dhoni's iconic six sealed India's second World Cup title in Mumbai." },
    ],
    rulebook: [
      { title: 'The Playing Field', content: 'Played on an oval field with a 22-yard pitch at its center. The boundary defines the limit of the playing area.' },
      { title: 'Scoring System', content: 'Runs are scored by running between wickets or hitting boundaries (4s and 6s).' },
      { title: 'Bowling & Fielding', content: 'Six balls make an over. Fielders aim to stop runs and take wickets through catches, run-outs, or bowling out the batsman.' },
      { title: "The Umpire's Call", content: 'Two on-field umpires make decisions, supported by a TV umpire for complex reviews (DRS).' },
    ],
  },
  football: {
    id: 'football',
    name: 'Football',
    description: 'The beautiful game, witnessing a massive resurgence across India.',
    longDescription:
      "Football has a deep-rooted history in India, particularly in Bengal, Goa, and the North East. The sport is currently experiencing a renaissance with professional leagues and growing international exposure.",
    tags: ['Endurance', 'Teamwork', 'Global Sensation'],
    history: [
      { year: '1888', event: 'Durand Cup', description: "The world's third oldest football tournament was established in Shimla." },
      { year: '1911', event: 'IFA Shield Victory', description: 'Mohun Bagan became the first Indian club to defeat a British team (East Yorkshire Regiment).' },
      { year: '1948', event: 'Olympic Debut', description: 'India participated in the London Olympics, playing barefoot against France.' },
      { year: '1951', event: 'Asian Games Gold', description: 'India won the first-ever Asian Games football gold in New Delhi.' },
      { year: '2013', event: 'ISL Foundation', description: 'The Indian Super League was founded, revolutionizing professional football in the country.' },
    ],
    rulebook: [
      { title: 'The Goal', content: 'Scored when the ball completely crosses the goal line between the posts.' },
      { title: 'Offside Rule', content: "Prevents attackers from gaining an unfair advantage near the opponent's goal." },
      { title: 'Fouls & Misconduct', content: 'Regulated by yellow and red cards. Direct or indirect free kicks are awarded for violations.' },
      { title: 'Duration', content: 'A standard match consists of two 45-minute halves with a 15-minute break.' },
    ],
  },
  kabaddi: {
    id: 'kabaddi',
    name: 'Kabaddi',
    description: 'An indigenous tactical battle of strength and agility.',
    longDescription:
      'Kabaddi is an ancient Indian sport that combines wrestling, rugby, and tag. It requires immense physical strength, tactical intelligence, and lung capacity as raiders must hold their breath.',
    tags: ['Tactical', 'Strength', 'Indigenous'],
    history: [
      { year: 'Ancient', event: 'Origins', description: 'Tracing back to Vedic India, used as a form of physical combat training.' },
      { year: '1950', event: 'KFI Formation', description: 'The Kabaddi Federation of India was established to standardize rules.' },
      { year: '1990', event: 'Asian Games Debut', description: 'Kabaddi was included in the Beijing Asian Games, with India winning gold.' },
      { year: '2014', event: 'Pro Kabaddi League', description: 'The PKL was launched, bringing the sport into the modern commercial era.' },
    ],
    rulebook: [
      { title: 'The Raid', content: "A raider enters the opponent's court chanting 'Kabaddi' and tries to touch defenders." },
      { title: 'Defense', content: 'Defenders work as a chain to capture the raider and prevent them from returning.' },
      { title: 'Lona', content: "Awarded when an entire team is declared 'out', giving the opponents two extra points." },
      { title: 'Revival', content: 'Players are revived in the order they were sent out when their team scores a point.' },
    ],
  },
  badminton: {
    id: 'badminton',
    name: 'Badminton',
    description: 'Lightning reflexes and elegant athleticism on the court.',
    longDescription:
      "Badminton has become one of India's most successful individual sports on the world stage. From the courts of Pune (where modern 'Poona' originated) to Olympic podiums.",
    tags: ['Agility', 'Individual Excellence', 'Fast-Paced'],
    history: [
      { year: '1870s', event: 'Origins in Pune', description: "British officers developed the game 'Poona', the direct ancestor of modern badminton." },
      { year: '1980', event: 'All England Title', description: 'Prakash Padukone became the first Indian to win the prestigious All England Championship.' },
      { year: '2001', event: 'Pullela Gopichand', description: 'Gopichand won the All England title, later becoming a legendary coach.' },
      { year: '2016', event: 'Olympic Silver', description: 'PV Sindhu became the first Indian woman to win an Olympic silver medal.' },
    ],
    rulebook: [
      { title: 'Service', content: 'Must be hit underhand and diagonally across the net.' },
      { title: 'Scoring', content: 'Best of three games to 21 points. A point is scored on every rally.' },
      { title: 'Faults', content: 'Includes touching the net, hitting the shuttle out, or a player hitting it twice.' },
      { title: 'The Let', content: 'Called for accidental interference or if the shuttle gets stuck in the net.' },
    ],
  },
  tennis: {
    id: 'tennis',
    name: 'Tennis',
    description: 'A legacy of doubles dominance and individual gritty battles.',
    longDescription:
      'Tennis in India has a storied history of producing legendary doubles players and some of the most memorable Davis Cup performances in sporting history.',
    tags: ['Technique', 'Legacy', 'Precision'],
    history: [
      { year: '1880s', event: 'Introduction', description: 'Brought to India by British officials, with the first tournaments in the late 19th century.' },
      { year: '1966', event: 'Davis Cup Final', description: 'India reached their first Davis Cup final, led by Ramanathan Krishnan.' },
      { year: '1999', event: 'World No. 1 Doubles', description: "Leander Paes and Mahesh Bhupathi became the world's top-ranked doubles pair." },
      { year: '2015', event: "Sania Mirza's Peak", description: "Sania Mirza became the World No. 1 in women's doubles." },
    ],
    rulebook: [
      { title: 'The Serve', content: "Starts behind the baseline. A 'let' is called if the ball hits the net and lands in." },
      { title: 'Deuce', content: 'A tie at 40-40 requires winning two consecutive points to take the game.' },
      { title: 'Sets & Games', content: 'Matches are usually best of 3 or 5 sets, with 6 games to win a set.' },
      { title: 'Tie-Break', content: 'Played at 6-6 in a set to decide the winner by reaching 7 points first.' },
    ],
  },
  hockey: {
    id: 'hockey',
    name: 'Hockey',
    description: 'The golden legacy of Indian wizardry on the turf.',
    longDescription:
      "Once the unrivalled kings of the world, Indian hockey is synonymous with 'Wizard' Dhyan Chand. The sport is currently on an upward trajectory with a focus on fitness and modern tactics.",
    tags: ['Wizardry', 'National Heritage', 'Speed'],
    history: [
      { year: '1928', event: 'First Olympic Gold', description: 'India won its first gold in Amsterdam, beginning a 32-year unbeaten run.' },
      { year: '1936', event: 'Berlin Glory', description: 'Dhyan Chand led India to a legendary win over Germany in the final.' },
      { year: '1975', event: 'World Cup Title', description: 'India won its only World Cup title by defeating Pakistan in Kuala Lumpur.' },
      { year: '2021', event: 'Tokyo Bronze', description: 'The Indian team ended a 41-year Olympic medal drought with a bronze.' },
    ],
    rulebook: [
      { title: 'Penalty Corner', content: 'Awarded for defensive fouls in the circle. A crucial scoring opportunity.' },
      { title: 'The Sticks', content: 'Players can only use the flat side of the stick to play the ball.' },
      { title: 'No Body Contact', content: 'Players cannot use their feet or body to stop or move the ball.' },
      { title: 'Green/Yellow Cards', content: "Time-bound suspensions for fouls, maintaining the game's high intensity." },
    ],
  },
};

export function toSportSlug(name: string) {
  return (name || '').trim().toLowerCase();
}

export function toSportLabel(slug: string) {
  const key = toSportSlug(slug);
  const metadata = ADDITIONAL_SPORTS_DATA[key];
  return metadata?.name || 'Cricket';
}
