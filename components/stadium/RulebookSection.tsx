import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { landingColors, landingFonts } from '@/components/landing/theme';
import { AnimatedReveal } from './AnimatedReveal';
import { SectionHeader } from './SectionHeader';
import { RuleSection } from './types';

type Props = {
  sportName: string;
  sections: RuleSection[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

export function RulebookSection({ sportName, sections, activeIndex, onSelect }: Props) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <AnimatedReveal delay={280}>
      <View style={[styles.section, styles.darkSection]}>
        <SectionHeader kicker="Rulebook" title={`${sportName} Essentials`} light />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ruleNav}>
          {sections.map((rule, index) => (
            <Pressable
              key={`${rule.title}-${index}`}
              onPress={() => onSelect(index)}
              style={({ pressed }) => [
                styles.ruleNavButton,
                activeIndex === index && styles.ruleNavButtonActive,
                pressed && styles.ruleNavButtonPressed,
              ]}>
              <Text style={[styles.ruleNavText, activeIndex === index && styles.ruleNavTextActive]}>{rule.title}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.ruleContentBox}>
          <Text style={styles.ruleContentTitle}>{sections[activeIndex]?.title}</Text>
          <Text style={styles.ruleContentBody}>{sections[activeIndex]?.content}</Text>
        </View>
      </View>
    </AnimatedReveal>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  darkSection: {
    backgroundColor: landingColors.plum,
    marginTop: 8,
    paddingTop: 18,
    paddingBottom: 16,
  },
  ruleNav: {
    gap: 8,
    paddingRight: 10,
    marginTop: 6,
    marginBottom: 10,
  },
  ruleNavButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(238,235,221,0.25)',
    backgroundColor: 'rgba(238,235,221,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ruleNavButtonActive: {
    backgroundColor: landingColors.rose,
    borderColor: landingColors.rose,
  },
  ruleNavButtonPressed: {
    opacity: 0.86,
  },
  ruleNavText: {
    color: 'rgba(238,235,221,0.80)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 9,
    fontFamily: landingFonts.sansSemiBold,
  },
  ruleNavTextActive: {
    color: landingColors.blush,
  },
  ruleContentBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(238,235,221,0.16)',
    backgroundColor: 'rgba(238,235,221,0.06)',
    padding: 12,
  },
  ruleContentTitle: {
    color: landingColors.rose,
    fontSize: 18,
    marginBottom: 8,
    fontFamily: landingFonts.serifRegular,
  },
  ruleContentBody: {
    color: 'rgba(238,235,221,0.83)',
    fontSize: 12,
    lineHeight: 19,
    fontFamily: landingFonts.sansRegular,
  },
});
