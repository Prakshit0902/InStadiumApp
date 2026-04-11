import { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import * as WebBrowser from 'expo-web-browser';
import { landingColors, landingFonts } from './theme';
import { SportRule } from './sports-page-data';

type Props = {
  sportName: string;
  rules: SportRule[];
  fullGuideUrl?: string;
  fullGuideCourtesy?: string;
};

export function SportsInteractiveRulebook({ sportName, rules, fullGuideUrl, fullGuideCourtesy }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoVisible, setVideoVisible] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);

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

  const handleWatchVideo = (url?: string) => {
    if (url) {
      setCurrentVideoUrl(url);
      setVideoVisible(true);
    }
  };

  const handleOpenFullGuide = async () => {
    if (fullGuideUrl) {
      await WebBrowser.openBrowserAsync(fullGuideUrl);
    }
  };

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
          <View style={styles.headerSubtitleRow}>
            <Text style={styles.headerSubtitle}>Master the game of {sportName}</Text>
            {!!fullGuideUrl && (
              <View style={styles.guideActionRow}>
                <Pressable onPress={handleOpenFullGuide} style={styles.fullGuideLink}>
                  <Text style={styles.fullGuideLinkText}>Full Guide</Text>
                  <Ionicons name="open-outline" size={10} color={landingColors.blush} />
                </Pressable>
                {!!fullGuideCourtesy && (
                  <Text style={styles.courtesyText}>Courtesy: {fullGuideCourtesy}</Text>
                )}
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.navScrollArea}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navWrap}>
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
                  {active && (
                    <Ionicons
                      name="chevron-down"
                      size={10}
                      color={landingColors.blush}
                      style={{ marginLeft: 4 }}
                    />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.ruleBodyWrap}>
          <Text style={styles.ruleTitle}>{activeRule.title}</Text>
          <View style={styles.ruleTextWrap}>
            {activeRule.content.split('\n').map((paragraph, index) => (
              <Text key={`${activeRule.title}-${index}`} style={styles.ruleBody}>
                {paragraph}
              </Text>
            ))}
          </View>

          {activeRule.videoUrl && (
            <View style={styles.inlineVideoContainer}>
              <Video
                source={{ uri: activeRule.videoUrl }}
                rate={1.0}
                volume={1.0}
                isMuted={true}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping
                style={styles.inlineVideo}
              />
            </View>
          )}

          <View style={styles.footerRow}>
            <View>
              <Text style={styles.skillLabel}>Rule Complexity</Text>
              <View style={styles.skillBars}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <View key={level} style={[styles.skillBar, level <= skillLevel ? styles.skillBarActive : styles.skillBarMuted]} />
                ))}
              </View>
            </View>

            {!!fullGuideUrl && (
              <Pressable onPress={handleOpenFullGuide} style={styles.videoBtn}>
                <Ionicons name="desktop-outline" size={11} color={landingColors.rose} />
                <Text style={styles.videoBtnText}>Full Visual Guide</Text>
              </Pressable>
            )}
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
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  headerSubtitle: {
    color: 'rgba(238, 235, 221, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1.3,
    fontSize: 9,
    fontFamily: landingFonts.sansMedium,
    flexShrink: 1,
  },
  guideActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  courtesyText: {
    color: 'rgba(238, 235, 221, 0.3)',
    fontSize: 8,
    fontFamily: landingFonts.sansRegular,
    fontStyle: 'italic',
  },
  fullGuideLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(238, 235, 221, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  fullGuideLinkText: {
    color: landingColors.blush,
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: landingFonts.sansSemiBold,
  },
  contentRow: {
    gap: 16,
  },
  navScrollArea: {
    marginBottom: 4,
  },
  navWrap: {
    gap: 8,
    paddingRight: 20,
  },
  navButton: {
    borderRadius: 99,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButtonActive: {
    backgroundColor: landingColors.rose,
    borderColor: landingColors.rose,
  },
  navButtonPressed: {
    opacity: 0.86,
  },
  navButtonText: {
    color: 'rgba(238, 235, 221, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontSize: 10,
    fontFamily: landingFonts.sansSemiBold,
  },
  navButtonTextActive: {
    color: landingColors.blush,
  },
  ruleBodyWrap: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 20,
  },
  ruleTitle: {
    color: landingColors.blush,
    fontSize: 28,
    lineHeight: 32,
    marginBottom: 12,
    fontFamily: landingFonts.garamondRegular,
  },
  ruleTextWrap: {
    gap: 10,
    marginBottom: 20,
  },
  ruleBody: {
    color: 'rgba(238, 235, 221, 0.8)',
    fontSize: 15,
    lineHeight: 24,
    fontFamily: landingFonts.sansRegular,
  },
  inlineVideoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inlineVideo: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
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
    marginBottom: 6,
    fontFamily: landingFonts.sansMedium,
  },
  skillBars: {
    flexDirection: 'row',
    gap: 4,
  },
  skillBar: {
    width: 14,
    height: 3,
    borderRadius: 999,
  },
  skillBarActive: {
    backgroundColor: landingColors.rose,
  },
  skillBarMuted: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  videoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(129,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(129,0,0,0.3)',
  },
  videoBtnText: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontSize: 9,
    fontFamily: landingFonts.sansSemiBold,
  },
});
