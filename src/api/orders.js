import { db } from '@/services/firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';

export const getOrders = async (status = null) => {
  try {
    let q = query(collection(db, 'ordenes'), orderBy('fecha', 'desc'));
    
    if (status && status !== 'todos') {
      q = query(q, where('estado', '==', status));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fecha: new Date(doc.data().fecha)
    }));
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const orderRef = doc(db, 'ordenes', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      throw new Error('Order not found');
    }
    
    return {
      id: orderSnap.id,
      ...orderSnap.data(),
      fecha: orderSnap.data().fecha ? new Date(orderSnap.data().fecha) : new Date()
    };
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const orderRef = doc(db, 'ordenes', orderId);
    await updateDoc(orderRef, { estado: newStatus });
    return true;
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};