import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file for faster uploads.
 * @param file The original image file
 * @param maxWidth Max width in pixels (default 1920 for banners)
 * @returns Promise with the compressed file
 */
export const compressImage = async (file: File, maxWidth: number = 1920): Promise<File> => {
  const options = {
    maxSizeMB: 1, // Max size 1MB
    maxWidthOrHeight: maxWidth,
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log(`Original size: ${file.size / 1024 / 1024} MB`);
    console.log(`Compressed size: ${compressedFile.size / 1024 / 1024} MB`);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    return file; // Return original if compression fails
  }
};
