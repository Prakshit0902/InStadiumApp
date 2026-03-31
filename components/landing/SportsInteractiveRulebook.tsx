import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { landingColors, landingFonts } from './theme';
import { SportRule } from './sports-page-data';

type Props = {
  sportName: string;
  rules: SportRule[];
};

export function SportsInteractiveRulebook({ sportName, rules }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const safeIndex = useMemo(() => {
    if (rules.length === 0) {
      return 0;
    }
    return Math.min(activeIndex, rules.length - 1);
  }, [activeIndex, rules.length]);

  if (rules.length === 0) {
    return null;
  }

  const activeRule = rules[safeIndex];
  const skillLevel = Math.min(5, safeIndex + 2);

  return (
    <View style={styles.cardWrap}>
      <View style={styles.headerRow}>
        <View style={styles.infoBadge}>
          <Ionicons name="information" size={16} color={landingColors.blush} />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>
            The <Text style={styles.headerTitleAccent}>Official</Text> Rulebook
          </Text>
          <Text style={styles.headerSubtitle}>Master the game of {sportName}</Text>
        </View>
      </View>

      <View style={styles.contentRow}>
        <ScrollView horizontal={false} contentContainerStyle={styles.navWrap} showsVerticalScrollIndicator={false}>
          {rules.map((rule, index) => {
            const active = index === safeIndex;
            return (
              <Pressable
                key={`${rule.title}-${index}`}
                onPress={() => setActiveIndex(index)}
                style={({ pressed }) => [
                  styles.navButton,
                  active && styles.navButtonActive,
                  pressed && styles.navButtonPressed,
                ]}>
                <Text style={[styles.navButtonText, active && styles.navButtonTextActive]}>{rule.title}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color={active ? landingColors.blush : 'rgba(238, 235, 221, 0.5)'}
                  style={!active ? styles.chevronHidden : undefined}
                />
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.ruleBodyWrap}>
          <Text style={styles.ruleTitle}>{activeRule.title}</Text>
          <View style={styles.ruleTextWrap}>
            {activeRule.content.split('\n').map((paragraph, index) => (
              <Text key={`${activeRule.title}-${index}`} style={styles.ruleBody}>
                {paragraph}
              </Text>
            ))}
          </View>

          <View style={styles.footerRow}>
            <View>
              <Text style={styles.skillLabel}>Skill Level</Text>
              <View style={styles.skillBars}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <View key={level} style={[styles.skillBar, level <= skillLevel ? styles.skillBarActive : styles.skillBarMuted]} />
                ))}
              </View>
            </View>

            <Pressable style={styles.videoBtn}>
              <Ionicons name="play" size={11} color={landingColors.rose} />
              <Text style={styles.videoBtnText}>Watch Video Guide</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    borderRadius: 24,
    backgroundColor: landingColors.plum,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  infoBadge: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: landingColors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    color: landingColors.blush,
    fontSize: 31,
    lineHeight: 34,
    fontFamily: landingFonts.garamondItalic,
  },
  headerTitleAccent: {
    fontFamily: landingFonts.garamondRegular,
    fontStyle: 'normal',
  },
  headerSubtitle: {
    color: 'rgba(238, 235, 221, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1.3,
    fontSize: 9,
    marginTop: 2,
    fontFamily: landingFonts.sansMedium,
  },
  contentRow: {
    gap: 12,
  },
  navWrap: {
    gap: 8,
  },
  navButton: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButtonActive: {
    backgroundColor: landingColors.rose,
    borderColor: landingColors.rose,
  },
  navButtonPressed: {
    opacity: 0.86,
  },
  navButtonText: {
    color: 'rgba(238, 235, 221, 0.75)',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontSize: 10,
    fontFamily: landingFonts.sansSemiBold,
    flexShrink: 1,
    paddingRight: 8,
  },
  navButtonTextActive: {
    color: landingColors.blush,
  },
  chevronHidden: {
    opacity: 0.25,
  },
  ruleBodyWrap: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    minHeight: 180,
  },
  ruleTitle: {
    color: landingColors.rose,
    fontSize: 31,
    lineHeight: 34,
    marginBottom: 8,
    fontFamily: landingFonts.garamondRegular,
  },
  ruleTextWrap: {
    gap: 5,
  },
  ruleBody: {
    color: 'rgba(238, 235, 221, 0.72)',
    fontSize: 14,
    lineHeight: 22,
    fontFamily: landingFonts.sansRegular,
  },
  footerRow: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.10)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  skillLabel: {
    color: 'rgba(238, 235, 221, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontSize: 8,
    marginBottom: 4,
    fontFamily: landingFonts.sansMedium,
  },
  skillBars: {
    flexDirection: 'row',
    gap: 4,
  },
  skillBar: {
    width: 12,
    height: 3,
    borderRadius: 999,
  },
  skillBarActive: {
    backgroundColor: landingColors.rose,
  },
  skillBarMuted: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  videoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  videoBtnText: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontSize: 9,
    fontFamily: landingFonts.sansSemiBold,
  },
});
