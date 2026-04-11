export type SportRule = {
  title: string;
  content: string;
  videoUrl?: string;
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
  fullGuideUrl?: string;
  fullGuideCourtesy?: string;
  federationUrl: string;
  heroImage?: string;
};

export const SPORTS_HUB_DATA: Record<string, { description: string; rulebook: SportRule[] }> = {
  Cricket: {
    description:
      "Known as the 'Gentleman's Game', cricket is a multi-format sport with a rich heritage in India. From the traditional Test matches to the high-octane T20 IPL, it's more than just a sport; it's an emotion.",
    rulebook: [
      {
        title: 'The Pitch',
        content:
          "A central 22-yard strip where the main action happens. It's carefully curated to influence the ball's movement—some favor fast bowlers with bounce, while others assist spinners as the match progresses.",
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775395348/The_Pitch_wlpzie.mp4',
      },
      {
        title: 'The Over',
        content:
          'A set of six legal deliveries bowled by a single player from one end of the pitch. After an over, the bowling end changes, and a different player takes over, ensuring a strategic rotation of pace and guile.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775395338/The_Over_mfjbuh.mp4',
      },
      {
        title: 'Wickets',
        content:
          'The primary objective for bowlers. There are 10 ways to get a batsman out, including being bowled (hitting the stumps), caught, Leg Before Wicket (LBW), or run out while trying to complete a run.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775395337/Wickets_y5ts27.mp4',
      },
      {
        title: 'Scoring Runs',
        content:
          'Batsmen score runs by hitting the ball and running between the wickets. Hitting the ball to the boundary scores 4 runs, while clearing the rope on the full earns a maximum of 6 runs.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775395328/Scoring_Runs_l4pi8a.mp4',
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
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775415708/The_Goal_il3bys.mp4',
      },
      {
        title: 'Fouls & Cards',
        content:
          'Physical contact is regulated. Reckless play or unsporting behavior results in a Yellow Card (warning) or a Red Card (ejection). Professional fouls can lead to direct free kicks or penalties.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775415693/Fouls_iwp0sr.mp4',
      },
      {
        title: 'Offside Rule',
        content:
          "A strategic rule preventing 'goal-hanging'. An attacking player must have at least two opponents (usually the keeper and one defender) between them and the goal line when the ball is played to them.",
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775415695/Offside_Rule_lede0e.mp4',
      },
      {
        title: 'Corner Kicks',
        content:
          "Awarded when the defending team is the last to touch the ball before it crosses their own goal line (excluding goals). It's a prime opportunity for set-piece specialists to create scoring chances.",
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775415696/Corner_Kicks_mxxpx4.mp4',
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
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775828648/The_Raid_ppgzbh.mp4',
      },
      {
        title: 'Touch & Tag',
        content:
          "Points are scored for every defender the raider touches before returning. Defenders are 'out' and must leave the mat until a teammate scores a point to revive them.",
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775828647/Touch_Tag_xlwhzh.mp4',
      },
      {
        title: 'The Tackle',
        content:
          'Defenders (Antis) work together to trap the raider and prevent them from reaching the midline. A successful tackle earns the defending team a point and revives one of their own players.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775828648/The_Tackle_cooni7.mp4',
      },
      {
        title: 'Bonus Point',
        content:
          "A raider can earn an extra point by crossing the 'Bonus Line' when there are 6 or 7 defenders active on the mat, even if they don't touch any opponent.",
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775828646/Bonus_Point_buabw1.mp4',
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
          "Must be hit underhand and diagonally into the opponent's service court. In professional play, the shuttle must be hit from below the server's waist height.",
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775887071/The_Serve_gcwufh.mp4',
      },
      {
        title: 'Rally Scoring',
        content:
          'A point is won on every serve, regardless of who is serving. Matches are usually best of three games, with each game played to 21 points.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775887070/Rally_Scoring_anf646.mp4',
      },
      {
        title: 'Let',
        content:
          'A call made by the umpire to halt play when an unforeseen accident or distraction occurs. The point is replayed.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775887072/Let_kuljld.mp4',
      },
      {
        title: 'Faults',
        content:
          'Includes the shuttle landing outside boundaries, failing to pass over the net, or touching the net with the racket or body.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775887070/Faults_fmxiam.mp4',
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
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775887287/GameSetMatch_cu7iir.mp4',
      },
      {
        title: 'The Serve',
        content:
          "Starting the point from behind the baseline. If it hits the net but lands in the correct service box, it's a 'Let' (replay). Missing twice results in a Double Fault and loss of the point.",
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775887285/The_Serve_mq2jda.mp4',
      },
      {
        title: 'The Deuce',
        content:
          "A Tie at 40-all. A player must win two consecutive points (Advantage and then Game Point) to win the game. This creates the most high-pressure moments in the sport.",
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775887286/Deuce_s3ab9y.mp4',
      },
      {
        title: 'Baseline Play',
        content:
          'The strategic exchange of groundstrokes from the back of the court. Players use topspin, slice, and varying depths to outmaneuver opponents and create winning opportunities.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775887285/Baseline_Play_vjange.mp4',
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
          'Awarded for defensive fouls inside the circle. The ball is pushed from the backline to attackers at the top of the circle.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775888147/Penalty_Corner_qursvq.mp4',
      },
      {
        title: 'The Cards',
        content:
          'Green (2 min suspension), Yellow (5-10 min suspension), and Red (Permanent exclusion) are used for discipline.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775888143/The_Cards_gvz9id.mp4',
      },
      {
        title: 'No-Feet Rule',
        content:
          'Players (except goalkeepers inside the circle) are not allowed to use their feet or any part of their body to play the ball.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775888161/No_Feet_Rule_getc6d.mp4',
      },
      {
        title: 'Dangerous Play',
        content:
          'Includes lifting the ball into an opponent, high-sticking, or any action that threatens player safety.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775888142/Dangerous_Play_xw8lqt.mp4',
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
      {
        title: 'The Pitch',
        content:
          "A central 22-yard strip where the main action happens. It's carefully curated to influence the ball's movement—some favor fast bowlers with bounce, while others assist spinners as the match progresses.",
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775395348/The_Pitch_wlpzie.mp4',
      },
      {
        title: 'The Over',
        content:
          'A set of six legal deliveries bowled by a single player from one end of the pitch. After an over, the bowling end changes, and a different player takes over, ensuring a strategic rotation of pace and guile.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775395338/The_Over_mfjbuh.mp4',
      },
      {
        title: 'Wickets',
        content:
          'The primary objective for bowlers. There are 10 ways to get a batsman out, including being bowled (hitting the stumps), caught, Leg Before Wicket (LBW), or run out while trying to complete a run.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775395337/Wickets_y5ts27.mp4',
      },
      {
        title: 'Scoring Runs',
        content:
          'Batsmen score runs by hitting the ball and running between the wickets. Hitting the ball to the boundary scores 4 runs, while clearing the rope on the full earns a maximum of 6 runs.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775395328/Scoring_Runs_l4pi8a.mp4',
      },
    ],
    fullGuideUrl: 'https://www.youtube.com/watch?v=VwII4y5vpyU',
    fullGuideCourtesy: 'wikiHow',
    federationUrl: 'https://www.bcci.tv/',
    heroImage: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1000&auto=format&fit=crop',
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
      {
        title: 'The Goal',
        content:
          "The main objective is to drive the ball into the opponent's net. A goal is scored when the entire ball crosses the goal line between the posts and under the crossbar.",
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775415708/The_Goal_il3bys.mp4',
      },
      {
        title: 'Fouls & Cards',
        content:
          'Physical contact is regulated. Reckless play or unsporting behavior results in a Yellow Card (warning) or a Red Card (ejection). Professional fouls can lead to direct free kicks or penalties.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775415693/Fouls_iwp0sr.mp4',
      },
      {
        title: 'Offside Rule',
        content:
          "A strategic rule preventing 'goal-hanging'. An attacking player must have at least two opponents (usually the keeper and one defender) between them and the goal line when the ball is played to them.",
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775415695/Offside_Rule_lede0e.mp4',
      },
      {
        title: 'Corner Kicks',
        content:
          "Awarded when the defending team is the last to touch the ball before it crosses their own goal line (excluding goals). It's a prime opportunity for set-piece specialists to create scoring chances.",
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775415696/Corner_Kicks_mxxpx4.mp4',
      },
    ],
    fullGuideUrl: 'https://www.youtube.com/watch?v=qknP-E-vPQ4',
    fullGuideCourtesy: 'wikiHow',
    federationUrl: 'https://www.the-aiff.com/',
    heroImage: 'https://images.unsplash.com/photo-1518605368461-1e1e38ce7058?q=80&w=1000&auto=format&fit=crop',
  },

  kabaddi: {
    id: 'kabaddi',
    name: 'Kabaddi',
    description: 'An ancient indigenous tactical battle of strength and agility.',
    longDescription:
      'Kabaddi is an ancient Indian sport that combines wrestling, rugby, and tag. It requires immense physical strength, tactical intelligence, and lung capacity as raiders must hold their breath while tagging opponents and returning to their half.',
    tags: ['Tactical', 'Strength', 'Indigenous'],
    history: [
      { year: 'Ancient', event: 'Origins', description: 'Tracing back to Vedic India, used as a form of physical combat training.' },
      { year: '1950', event: 'KFI Formation', description: 'The Kabaddi Federation of India was established to standardize rules.' },
      { year: '1990', event: 'Asian Games Debut', description: 'Kabaddi was included in the Beijing Asian Games, with India winning gold.' },
      { year: '2014', event: 'Pro Kabaddi League', description: 'The PKL was launched, bringing the sport into the modern commercial era.' },
    ],
    rulebook: [
      {
        title: 'The Raid',
        content:
          "An individual attacker (Raider) enters the opponent's half, chanting 'Kabaddi' without breaking their breath. They must touch at least one defender and return to their own half safely.",
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775828648/The_Raid_ppgzbh.mp4',
      },
      {
        title: 'Touch & Tag',
        content:
          "Points are scored for every defender the raider touches before returning. Defenders are 'out' and must leave the mat until a teammate scores a point to revive them.",
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775828647/Touch_Tag_xlwhzh.mp4',
      },
      {
        title: 'The Tackle',
        content:
          'Defenders (Antis) work together to trap the raider and prevent them from reaching the midline. A successful tackle earns the defending team a point and revives one of their own players.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775828648/The_Tackle_cooni7.mp4',
      },
      {
        title: 'Bonus Point',
        content:
          "A raider earns an extra point by crossing the 'Bonus Line' when there are 6 or 7 defenders active on the mat, even if they don't touch any opponent.",
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775828646/Bonus_Point_buabw1.mp4',
      },
    ],
    fullGuideUrl: 'https://youtu.be/ybdGREjvluU',
    fullGuideCourtesy: 'wikiHow',
    federationUrl: 'http://www.indiankabaddi.org/',
    heroImage: 'https://images.unsplash.com/photo-1589182337358-2cb63099350c?q=80&w=1000&auto=format&fit=crop',
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
      {
        title: 'The Serve',
        content:
          "Must be hit underhand and diagonally into the opponent's service court. In professional play, the shuttle must be hit from below the server's waist height.",
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775887071/The_Serve_gcwufh.mp4',
      },
      {
        title: 'Rally Scoring',
        content:
          'A point is won on every serve, regardless of who is serving. Matches are usually best of three games, with each game played to 21 points.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775887070/Rally_Scoring_anf646.mp4',
      },
      {
        title: 'Let',
        content:
          'A call made by the umpire to halt play when an unforeseen accident or distraction occurs. The point is replayed.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775887072/Let_kuljld.mp4',
      },
      {
        title: 'Faults',
        content:
          'Includes the shuttle landing outside boundaries, failing to pass over the net, or touching the net with the racket or body.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775887070/Faults_fmxiam.mp4',
      },
    ],
    fullGuideUrl: 'https://youtu.be/tAS7rOKtpgQ',
    fullGuideCourtesy: 'Mr. Animate',
    federationUrl: 'https://www.badmintonindia.org/',
    heroImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000&auto=format&fit=crop',
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
      {
        title: 'Game/Set/Match',
        content:
          "The scoring hierarchy. Four points win a game (15, 30, 40, Game), six games win a set, and two or three sets win the match. 'Deuce' occurs at 40-40, requiring a two-point lead.",
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775887287/GameSetMatch_cu7iir.mp4',
      },
      {
        title: 'The Serve',
        content:
          "Starting the point from behind the baseline. If it hits the net but lands in the correct service box, it's a 'Let' (replay). Missing twice results in a Double Fault and loss of the point.",
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775887285/The_Serve_mq2jda.mp4',
      },
      {
        title: 'The Deuce',
        content:
          "A Tie at 40-all. A player must win two consecutive points (Advantage and then Game Point) to win the game. This creates the most high-pressure moments in the sport.",
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775887286/Deuce_s3ab9y.mp4',
      },
      {
        title: 'Baseline Play',
        content:
          'The strategic exchange of groundstrokes from the back of the court. Players use topspin, slice, and varying depths to outmaneuver opponents and create winning opportunities.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775887285/Baseline_Play_vjange.mp4',
      },
    ],
    fullGuideUrl: 'https://youtu.be/zcagGHQhcMI',
    fullGuideCourtesy: 'wikiHow',
    federationUrl: 'https://www.aitatennis.com/',
    heroImage: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=1000&auto=format&fit=crop',
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
      {
        title: 'Penalty Corner',
        content:
          'Awarded for defensive fouls inside the circle. The ball is pushed from the backline to attackers at the top of the circle.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775888147/Penalty_Corner_qursvq.mp4',
      },
      {
        title: 'The Cards',
        content:
          'Green (2 min suspension), Yellow (5-10 min suspension), and Red (Permanent exclusion) are used for discipline.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775888143/The_Cards_gvz9id.mp4',
      },
      {
        title: 'No-Feet Rule',
        content:
          'Players (except goalkeepers inside the circle) are not allowed to use their feet or any part of their body to play the ball.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775888161/No_Feet_Rule_getc6d.mp4',
      },
      {
        title: 'Dangerous Play',
        content:
          'Includes lifting the ball into an opponent, high-sticking, or any action that threatens player safety.',
        videoUrl: 'https://res.cloudinary.com/daud2uqqf/video/upload/v1775888142/Dangerous_Play_xw8lqt.mp4',
      },
    ],
    fullGuideUrl: 'https://youtu.be/KUnLgiX44BQ',
    fullGuideCourtesy: 'wikiHow',
    federationUrl: 'https://www.hockeyindia.org/',
    heroImage: 'https://images.unsplash.com/photo-1590483259972-e1d5ca4431e2?q=80&w=1000&auto=format&fit=crop',
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
