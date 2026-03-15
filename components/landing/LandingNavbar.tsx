import { memo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { landingColors, landingFonts } from './theme';

type Props = {
  horizontalPadding: number;
};

function LandingNavbarBase({ horizontalPadding }: Props) {
  return (
    <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}> 
      <Text style={styles.logoText}>
        <Text style={styles.logoBadge}>In</Text>stadium
      </Text>

      <View style={styles.links}>
        {['Stadiums', 'Sports', 'About'].map((label) => (
          <Pressable
            key={label}
            onPress={() => Alert.alert('Coming Soon', `${label} screen is next migration phase.`)}
            android_ripple={{ color: 'rgba(129, 0, 0, 0.12)', borderless: false }}
            hitSlop={8}
            style={({ pressed }) => [styles.linkButton, pressed && styles.linkPressed]}>
            <Text style={styles.linkText}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export const LandingNavbar = memo(LandingNavbarBase);

const styles = StyleSheet.create({
  container: {
    minHeight: 64,
    paddingVertical: 12,
    backgroundColor: landingColors.blush,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: landingColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoText: {
    color: landingColors.plum,
    fontSize: 20,
    letterSpacing: 1,
    fontFamily: landingFonts.sansSemiBold,
  },
  logoBadge: {
    backgroundColor: landingColors.rose,
    color: landingColors.blush,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    fontStyle: 'italic',
    fontFamily: landingFonts.sansSemiBold,
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  linkButton: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  linkPressed: {
    opacity: 0.7,
  },
  linkText: {
    fontSize: 10,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: landingColors.muted,
    fontFamily: landingFonts.sansSemiBold,
  },
});
