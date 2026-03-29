/**
 * Returns an optimized Cloudinary URL for an image publicId.
 * Falls back to a plain URL/path when Cloudinary metadata is unavailable.
 */
export function getOptimizedImageUrl(publicId, options = {}) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const fallbackImage = 'https://images.unsplash.com/photo-1540744158800-4785387f481c?q=80';
    if (!publicId)
        return fallbackImage;
    if (!cloudName)
        return publicId;
    if (publicId.startsWith('/') || publicId.startsWith('http')) {
        return publicId;
    }
    const transformations = [];
    if (options.width)
        transformations.push(`w_${options.width}`);
    if (options.height)
        transformations.push(`h_${options.height}`);
    if (options.crop)
        transformations.push(`c_${options.crop}`);
    transformations.push('f_auto');
    transformations.push('q_auto');
    const transformationString = transformations.length > 0 ? `${transformations.join(',')}/` : '';
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}${publicId}`;
}
