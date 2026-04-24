/**
 * Service for handling image uploads and deletions using Cloudinary API.
 */

const CLOUD_NAME = 'dsfnladar';
const UPLOAD_PRESET = 'marketplace';
const API_KEY = '949681764298537';
// Note: api_secret is ideally handled on the server side, but keeping current implementation for parity.
const API_SECRET = 's-fpq822vCf2MWKlK1y48-HDeks';

/**
 * Uploads an image file to Cloudinary.
 * @param file The image file to upload
 * @returns Promise with the secure URL of the uploaded image
 */
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('cloud_name', CLOUD_NAME);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Image uploaded successfully to Cloudinary:', data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

/**
 * Deletes an image from Cloudinary using its public ID.
 * @param publicId The public ID of the image to delete
 * @returns Promise with the response from Cloudinary
 */
export const deleteImageFromCloudinary = async (publicId: string): Promise<any> => {
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_id: publicId,
        api_key: API_KEY,
        api_secret: API_SECRET,
        timestamp: Math.floor(Date.now() / 1000),
      }),
    });

    if (!response.ok) {
      throw new Error(`Cloudinary deletion failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Image deleted successfully from Cloudinary:', data);
    return data;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

export default {
  uploadImage: uploadImageToCloudinary,
  deleteImage: deleteImageFromCloudinary,
};
