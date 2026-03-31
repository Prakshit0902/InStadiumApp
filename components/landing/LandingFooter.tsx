import { memo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { landingColors, landingFonts } from './theme';

type Props = {
  horizontalPadding: number;
  onPrimaryActionPress?: () => void;
  onLinkPress?: (link: 'Stadiums' | 'Our Story' | 'Sports Directory' | 'Find Stadium') => void;
};

function LandingFooterBase({ horizontalPadding, onPrimaryActionPress, onLinkPress }: Props) {
  const links: ('Stadiums' | 'Our Story' | 'Sports Directory' | 'Find Stadium')[] = [
    'Stadiums',
    'Our Story',
    'Sports Directory',
    'Find Stadium',
  ];

  return (
    <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}> 
      <View style={styles.ctaPanel}>
        <Text style={styles.title}>
          Plan your next <Text style={styles.titleAccent}>stadium</Text> experience.
        </Text>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={onPrimaryActionPress || (() => Alert.alert('Stadium Inquiry', 'Opening stadium inquiries page.'))}
          android_ripple={{ color: 'rgba(238, 235, 221, 0.20)' }}>
          <Text style={styles.buttonText}>Plan Visit</Text>
        </Pressable>
      </View>

      <View style={styles.linksWrap}>
        {links.map((label) => (
          <Pressable
            key={label}
            onPress={() => onLinkPress?.(label)}
            android_ripple={{ color: 'rgba(129, 0, 0, 0.10)' }}
            style={({ pressed }) => [styles.linkRow, pressed && styles.linkPressed]}>
            <Text style={styles.link}>{label}</Text>
            <Text style={styles.linkArrow}>›</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export const LandingFooter = memo(LandingFooterBase);

const styles = StyleSheet.create({
  section: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: landingColors.border,
    paddingTop: 24,
    paddingBottom: 22,
    gap: 18,
  },
  ctaPanel: {
    backgroundColor: 'rgba(196,181,162,0.24)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.12)',
  },
  title: {
    color: landingColors.plum,
    fontSize: 31,
    lineHeight: 37,
    marginBottom: 14,
    fontFamily: landingFonts.serifRegular,
    fontWeight: '300',
  },
  titleAccent: {
    fontFamily: landingFonts.serifMediumItalic,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: landingColors.rose,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: landingColors.blush,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    fontSize: 11,
    fontFamily: landingFonts.sansSemiBold,
  },
  linksWrap: {
    gap: 8,
  },
  linkRow: {
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.44)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  link: {
    color: landingColors.muted,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: landingFonts.sansRegular,
  },
  linkArrow: {
    color: landingColors.rose,
    fontSize: 18,
    lineHeight: 20,
    fontFamily: landingFonts.sansMedium,
  },
});
