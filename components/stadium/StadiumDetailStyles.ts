import { StyleSheet } from 'react-native';
import { landingColors, landingFonts } from '@/components/landing/theme';

export const stadiumDetailStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: landingColors.blush,
  },
  content: {
    paddingBottom: 32,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 10,
  },
  stateTitle: {
    color: landingColors.plum,
    fontSize: 24,
    fontFamily: landingFonts.serifRegular,
  },
  stateText: {
    color: landingColors.muted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: landingFonts.sansRegular,
  },
  retryButton: {
    marginTop: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: landingColors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  retryText: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: landingColors.rose,
    fontSize: 10,
    fontFamily: landingFonts.sansSemiBold,
  },
  overviewSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  overviewText: {
    color: landingColors.muted,
    fontSize: 13,
    lineHeight: 21,
    fontFamily: landingFonts.sansRegular,
  },
});
