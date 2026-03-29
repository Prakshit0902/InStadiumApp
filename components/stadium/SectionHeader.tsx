import { StyleSheet, Text, View } from 'react-native';
import { landingColors, landingFonts } from '@/components/landing/theme';

type Props = {
  kicker: string;
  title: string;
  light?: boolean;
};

export function SectionHeader({ kicker, title, light = false }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>{kicker}</Text>
      <Text style={[styles.title, light && styles.titleLight]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 10,
  },
  kicker: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    fontSize: 10,
    marginBottom: 3,
    fontFamily: landingFonts.sansSemiBold,
  },
  title: {
    color: landingColors.plum,
    fontSize: 33,
    lineHeight: 37,
    fontFamily: landingFonts.serifRegular,
  },
  titleLight: {
    color: landingColors.blush,
  },
});
