import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { landingColors, landingFonts } from './theme';

type Props = {
  horizontalPadding: number;
};

function EditorialDividerBase({ horizontalPadding }: Props) {
  return (
    <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}> 
      <View style={styles.panel}>
        <Text style={styles.kicker}>InStadium Editorial</Text>
        <Text style={styles.text}>
          Discover India&apos;s most <Text style={styles.emphasis}>iconic sporting arenas</Text>, with interactive guides and
          real-time updates for fans.
        </Text>
      </View>
    </View>
  );
}

export const EditorialDivider = memo(EditorialDividerBase);

const styles = StyleSheet.create({
  section: {
    paddingVertical: 20,
  },
  panel: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.16)',
    backgroundColor: 'rgba(196,181,162,0.30)',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  kicker: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    fontSize: 10,
    marginBottom: 8,
    fontFamily: landingFonts.sansSemiBold,
  },
  text: {
    color: landingColors.muted,
    fontSize: 20,
    lineHeight: 30,
    fontFamily: landingFonts.serifRegular,
  },
  emphasis: {
    fontFamily: landingFonts.serifMedium,
    color: landingColors.plum,
    fontStyle: 'italic',
  },
});
