import { memo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { landingColors, landingFonts } from './theme';

type Props = {
  horizontalPadding: number;
};

function LandingFooterBase({ horizontalPadding }: Props) {
  return (
    <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}> 
      <View style={styles.ctaPanel}>
        <Text style={styles.title}>
          Inquire about your next <Text style={styles.titleAccent}>extraordinary</Text> event.
        </Text>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={() => Alert.alert('Inquiry', 'Inquiry form migration will be handled in the next phase.')}
          android_ripple={{ color: 'rgba(238, 235, 221, 0.20)' }}>
          <Text style={styles.buttonText}>Start the process</Text>
        </Pressable>
      </View>

      <View style={styles.linksWrap}>
        <Text style={styles.link}>Portfolio</Text>
        <Text style={styles.link}>About the Studio</Text>
        <Text style={styles.link}>Press and Media</Text>
        <Text style={styles.link}>Inquiries</Text>
      </View>
    </View>
  );
}

export const LandingFooter = memo(LandingFooterBase);

const styles = StyleSheet.create({
  section: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: landingColors.border,
    paddingTop: 42,
    paddingBottom: 24,
    gap: 20,
  },
  ctaPanel: {
    backgroundColor: 'rgba(196,181,162,0.24)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.12)',
  },
  title: {
    color: landingColors.plum,
    fontSize: 35,
    lineHeight: 41,
    marginBottom: 14,
    fontFamily: landingFonts.serifRegular,
  },
  titleAccent: {
    fontFamily: landingFonts.serifMedium,
    fontStyle: 'italic',
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
    letterSpacing: 2,
    fontSize: 11,
    fontFamily: landingFonts.sansSemiBold,
  },
  linksWrap: {
    gap: 10,
  },
  link: {
    color: landingColors.muted,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: landingFonts.sansRegular,
  },
});
