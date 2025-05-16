import { db } from '@/services/firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';

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
      // Asegúrate de convertir los timestamps de Firebase a Date
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      throw new Error('Order not found');
    }
    
    return {
      id: orderSnap.id,
      ...orderSnap.data(),
      // Convertir timestamp a Date
      createdAt: orderSnap.data().createdAt?.toDate() || new Date()
    };
  } catch (error) {
    console.error('Error getting order:', error);
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