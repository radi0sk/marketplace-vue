import { db } from '@/services/firebase';
import { 
  collection, 
  addDoc,
  getDocs, 
  doc, 
  updateDoc, 
  getDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import type { Product, Category } from '@/types/product';

// Collection Names
const PRODUCTS_COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';

/**
 * Get all products ordered by creation date
 */
export const getProducts = async (): Promise<Product[]> => {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
};

/**
 * Get a single product by ID
 */
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Product;
    } else {
      throw new Error('Product not found');
    }
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
};

/**
 * Create a new product
 */
export const createProduct = async (productData: Omit<Product, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Update an existing product
 */
export const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(productRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

/**
 * Get all categories
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      image: doc.data().image || ''
    })) as Category[];
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

/**
 * Create a new category
 */
export const addCategory = async (categoryData: { name: string; image?: string }): Promise<Category> => {
  try {
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
      name: categoryData.name,
      image: categoryData.image || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return {
      id: docRef.id,
      name: categoryData.name,
      image: categoryData.image || ''
    };
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};
