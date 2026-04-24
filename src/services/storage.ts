import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * @param file The file to upload
 * @param path The path in the storage bucket (e.g., 'products/image.jpg')
 * @returns Promise with the download URL
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    throw error;
  }
};

/**
 * Deletes a file from Firebase Storage.
 * @param url The full download URL of the file to delete
 */
export const deleteFile = async (url: string): Promise<void> => {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file from Firebase Storage:', error);
    throw error;
  }
};

/**
 * Helper to upload product images with a specific naming convention.
 */
export const uploadProductImage = async (file: File, productName: string): Promise<string> => {
  const timestamp = Date.now();
  const extension = file.name.split('.').pop();
  const sanitizedName = productName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const path = `products/${sanitizedName}-${timestamp}.${extension}`;
  return uploadFile(file, path);
};

/**
 * Helper to upload category images.
 */
export const uploadCategoryImage = async (file: File, categoryName: string): Promise<string> => {
  const timestamp = Date.now();
  const extension = file.name.split('.').pop();
  const sanitizedName = categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const path = `categories/${sanitizedName}-${timestamp}.${extension}`;
  return uploadFile(file, path);
};
