import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { getLocalStadiumImage } from '@/components/landing/data';
import { landingColors, landingFonts } from '@/components/landing/theme';
import { AnimatedReveal } from './AnimatedReveal';
import { SectionHeader } from './SectionHeader';
import { GalleryImage } from './types';

type Props = {
  gallery: (GalleryImage | string)[];
};

function resolveGallerySource(item: GalleryImage | string) {
  const url = typeof item === 'string' ? item : item.url;
  if (!url) return getLocalStadiumImage(undefined);
  // Raw http(s) URLs go directly to expo-image
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return { uri: url };
  }
  // Cloudinary public IDs go through the local resolver
  return getLocalStadiumImage(url);
}

export function GallerySection({ gallery }: Props) {
  if (gallery.length === 0) {
    return null;
  }

  return (
    <AnimatedReveal delay={80}>
      <View style={styles.section}>
        <SectionHeader kicker="Gallery" title="Visual Perspective" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryList}>
          {gallery.map((item, index) => {
            const source = resolveGallerySource(item);
            const caption = typeof item === 'string' ? `Frame ${index + 1}` : item.caption || `Frame ${index + 1}`;
            return (
              <View key={`${caption}-${index}`} style={[styles.galleryCard, index % 3 === 0 && styles.galleryCardLarge]}>
                <Image source={source} style={styles.galleryImage} contentFit="cover" transition={120} />
                <Text style={styles.galleryCaption}>{caption}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </AnimatedReveal>
  );
}


const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  galleryList: {
    gap: 12,
    paddingRight: 10,
    paddingTop: 4,
  },
  galleryCard: {
    width: 254,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(129,0,0,0.12)',
    backgroundColor: '#FFFFFF',
    padding: 8,
  },
  galleryCardLarge: {
    width: 286,
  },
  galleryImage: {
    width: '100%',
    height: 190,
    borderRadius: 12,
  },
  galleryCaption: {
    marginTop: 8,
    color: landingColors.muted,
    fontSize: 11,
    fontFamily: landingFonts.sansMedium,
  },
});
