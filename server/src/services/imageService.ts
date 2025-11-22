import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const optimizeImage = async (
  inputPath: string,
  cropData?: CropData,
  targetSize: number = 800
): Promise<string> => {
  try {
    const ext = path.extname(inputPath).toLowerCase();
    const isGif = ext === '.gif';
    const isWebp = ext === '.webp';

    // Check if image is animated (GIF and WebP can be animated)
    let isAnimated = false;
    if (isGif || isWebp) {
      const metadata = await sharp(inputPath).metadata();
      isAnimated = (metadata.pages || 1) > 1;
    }

    // Determine output format
    // - Animated images: preserve original format (GIF or WebP)
    // - Static images: convert to JPG for best compression
    let outputExt: string;
    if (isAnimated) {
      outputExt = ext; // Keep .gif or .webp for animated
    } else {
      outputExt = '.jpg';
    }

    const outputPath = inputPath.replace(
      path.extname(inputPath),
      `-optimized${outputExt}`
    );

    // For animated images, use animated: true to preserve all frames
    let pipeline = sharp(inputPath, { animated: isAnimated });
    const metadata = await pipeline.metadata();

    // Apply crop if provided
    if (cropData) {
      pipeline = pipeline.extract({
        left: Math.round(cropData.x),
        top: Math.round(cropData.y),
        width: Math.round(cropData.width),
        height: Math.round(cropData.height)
      });
    } else {
      // Auto-crop to center square if no crop data provided
      if (metadata.width && metadata.height && metadata.width !== metadata.height) {
        const size = Math.min(metadata.width, metadata.height);
        const left = Math.round((metadata.width - size) / 2);
        const top = Math.round((metadata.height - size) / 2);

        pipeline = pipeline.extract({
          left,
          top,
          width: size,
          height: size
        });
      }
    }

    // Resize
    pipeline = pipeline.resize(targetSize, targetSize, {
      fit: 'cover',
      withoutEnlargement: false
    });

    // Output in appropriate format
    if (isAnimated && isGif) {
      await pipeline
        .gif({ effort: 6 })
        .toFile(outputPath);
    } else if (isAnimated && isWebp) {
      await pipeline
        .webp({ effort: 5, quality: 80 })
        .toFile(outputPath);
    } else {
      await pipeline
        .jpeg({ quality: 85 })
        .toFile(outputPath);
    }

    // Delete original file
    await fs.unlink(inputPath);

    return outputPath;
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw error;
  }
};
