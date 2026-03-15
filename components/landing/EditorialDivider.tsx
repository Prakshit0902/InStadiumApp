import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { landingColors, landingFonts } from './theme';

type Props = {
  horizontalPadding: number;
};

function EditorialDividerBase({ horizontalPadding }: Props) {
  return (
    <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}> 
      <Text style={styles.text}>
        Discover India&apos;s most <Text style={styles.emphasis}>iconic sporting arenas</Text>, with interactive guides and real-time
        updates for fans.
      </Text>
    </View>
  );
}

export const EditorialDivider = memo(EditorialDividerBase);

const styles = StyleSheet.create({
  section: {
    backgroundColor: 'rgba(196,181,162,0.34)',
    paddingVertical: 38,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(129, 0, 0, 0.2)',
  },
  text: {
    color: landingColors.muted,
    textAlign: 'center',
    fontSize: 22,
    lineHeight: 33,
    fontFamily: landingFonts.serifRegular,
  },
  emphasis: {
    fontFamily: landingFonts.serifMedium,
    color: landingColors.plum,
    fontStyle: 'italic',
  },
});
