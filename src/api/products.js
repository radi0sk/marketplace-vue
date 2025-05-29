import { db } from '@/services/firebase';
import { 
  collection, 
  addDoc,
  getDocs, 
  doc, 
  updateDoc, 
  
  getDoc
} from 'firebase/firestore';

// Obtener todos los productos
export const getProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
};

// Crear nueva categoría con imagen (actualizada para coincidir con tu estructura de datos)
export const addCategory = async (categoryData) => {
  try {
    const docRef = await addDoc(collection(db, 'categories'), {
      name: categoryData.name,
      image: categoryData.image || '', // Usa la URL de la imagen o cadena vacía si no hay
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Retornamos el objeto completo de la categoría creada, similar a como lo espera tu componente
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

// Obtener un producto por ID
export const getProductById = async (id) => {
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        
        ...docSnap.data()
      };
    } else {
      throw new Error('Product not found');
    }
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
};

// Crear un nuevo producto
export const createProduct = async (productData) => {
  try {
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      categoria: productData.categoria,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Actualizar un producto
export const updateProduct = async (id, updates) => {
  try {
    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, {
      ...updates,
      categoria: updates.categoria,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Obtener categorías
// Obtener categorías (actualizada para coincidir con tu estructura)
export const getCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'categories'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      image: doc.data().image || ''
    }));
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

// Crear nueva categoría
export const createCategory = async (categoryName) => {
  try {
    const docRef = await addDoc(collection(db, 'categories'), {
      name: categoryName,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};