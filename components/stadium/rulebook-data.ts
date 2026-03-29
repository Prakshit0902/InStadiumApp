import { RuleSection } from './types';

export const fallbackRulebook: Record<string, RuleSection[]> = {
  cricket: [
    {
      title: 'Playing Field',
      content: 'Cricket is played on an oval field with a 22-yard pitch at the center. Boundaries decide fours and sixes.',
    },
    {
      title: 'Scoring',
      content: 'Runs come from running between wickets, boundaries, and extras. Wickets are key to limiting opposition totals.',
    },
    {
      title: 'Overs & Innings',
      content: 'Formats differ by overs. Teams alternate innings and the higher total wins the match.',
    },
  ],
  football: [
    {
      title: 'Match Format',
      content: 'Two halves of 45 minutes each. Added injury time is controlled by the referee.',
    },
    {
      title: 'Core Objective',
      content: 'A goal counts when the whole ball crosses the line between posts and under the crossbar.',
    },
    {
      title: 'Discipline',
      content: 'Fouls lead to free kicks and cards. Red card means dismissal and the team plays short.',
    },
  ],
  badminton: [
    {
      title: 'Scoring',
      content: 'Best of three games to 21 points, rally point scoring. Players must lead by two points.',
    },
    {
      title: 'Service',
      content: 'Serve diagonally and below waist height. Service order rotates by score parity.',
    },
    {
      title: 'Faults',
      content: 'Common faults include shuttle out, net touch, and double hit.',
    },
  ],
  tennis: [
    {
      title: 'Game Flow',
      content: 'Points progress as 15, 30, 40, game. At deuce, win two consecutive points.',
    },
    {
      title: 'Sets',
      content: 'Most matches are best of three sets; each set is generally won at six games with margin.',
    },
    {
      title: 'Tie-break',
      content: 'At 6-6, tie-break applies in most formats to decide the set.',
    },
  ],
  hockey: [
    {
      title: 'Basic Rules',
      content: 'Only the flat side of stick can be used. Ball contact with feet is generally penalized.',
    },
    {
      title: 'Penalty Corner',
      content: 'Major attacking chance awarded for specific defensive infringements in the shooting circle.',
    },
    {
      title: 'Cards',
      content: 'Green, yellow, and red cards enforce discipline with timed suspensions or dismissals.',
    },
  ],
  kabaddi: [
    {
      title: 'Raid',
      content: 'A raider enters opposition half, scores by tags, and must return safely before being tackled.',
    },
    {
      title: 'Defense',
      content: 'Defenders work in coordinated tackles to stop the raider and claim points.',
    },
    {
      title: 'Revival',
      content: 'Scoring points revives teammates in order; all-out situations award additional points.',
    },
  ],
};
