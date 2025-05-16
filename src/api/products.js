import { db } from '@/services/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  getDoc // Agrega esta línea
} from 'firebase/firestore';

export const getOrders = async (status = null) => {
  try {
    let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    }));
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
};

export const updateOrder = async (orderId, updates) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, updates);
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt.toDate()
      };
    } else {
      throw new Error('Order not found');
    }
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
};