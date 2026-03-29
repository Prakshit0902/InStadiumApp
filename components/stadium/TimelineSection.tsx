import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { landingColors, landingFonts } from '@/components/landing/theme';
import { AnimatedReveal } from './AnimatedReveal';
import { SectionHeader } from './SectionHeader';
import { TimelineItem } from './types';

type Props = {
  timeline: TimelineItem[];
};

export function TimelineSection({ timeline }: Props) {
  const { width } = useWindowDimensions();
  const isWide = width >= 780;

  if (timeline.length === 0) {
    return null;
  }

  return (
    <AnimatedReveal delay={120}>
      <View style={[styles.section, styles.timelineSection]}>
        <SectionHeader kicker="History" title="Heritage & Legacy" light />
        <View style={[styles.track, !isWide && styles.trackMobile]} />
        {timeline.map((item, index) => {
          const alignRight = isWide && index % 2 === 1;
          return (
            <View key={`${item.year || index}-${index}`} style={styles.rowWrap}>
              <View style={[styles.card, isWide ? (alignRight ? styles.rightCard : styles.leftCard) : styles.mobileCard]}>
                <Text style={styles.year}>{item.year || 'Era'}</Text>
                <Text style={styles.title}>{item.title || item.event || 'Milestone'}</Text>
                {!!(item.description || item.event) && <Text style={styles.body}>{item.description || item.event}</Text>}
              </View>
              <View style={[styles.node, !isWide && styles.nodeMobile]} />
            </View>
          );
        })}
      </View>
    </AnimatedReveal>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  timelineSection: {
    backgroundColor: landingColors.plum,
    marginHorizontal: 20,
    borderRadius: 20,
    paddingTop: 18,
    paddingBottom: 16,
    marginTop: 8,
    overflow: 'hidden',
  },
  track: {
    position: 'absolute',
    left: '50%',
    top: 92,
    bottom: 22,
    width: 2,
    backgroundColor: 'rgba(129, 0, 0, 0.35)',
    marginLeft: -1,
  },
  rowWrap: {
    position: 'relative',
    minHeight: 108,
    justifyContent: 'center',
    marginBottom: 12,
  },
  node: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 14,
    height: 14,
    borderRadius: 99,
    backgroundColor: landingColors.rose,
    marginLeft: -7,
    marginTop: -7,
    borderWidth: 3,
    borderColor: landingColors.plum,
  },
  nodeMobile: {
    left: '8%',
    marginLeft: -7,
  },
  card: {
    width: '43%',
    borderRadius: 16,
    padding: 10,
    backgroundColor: 'rgba(238, 235, 221, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(238, 235, 221, 0.14)',
  },
  leftCard: {
    marginRight: '57%',
  },
  rightCard: {
    marginLeft: '57%',
  },
  mobileCard: {
    width: '90%',
    marginLeft: '8%',
  },
  trackMobile: {
    left: '8%',
    marginLeft: -1,
  },
  year: {
    color: landingColors.rose,
    fontSize: 12,
    marginBottom: 2,
    fontFamily: landingFonts.serifMedium,
  },
  title: {
    color: landingColors.blush,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: landingFonts.serifRegular,
  },
  body: {
    color: 'rgba(238, 235, 221, 0.76)',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
    fontFamily: landingFonts.sansRegular,
  },
});
