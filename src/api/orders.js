import { db } from '@/services/firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  runTransaction,
  arrayUnion
} from 'firebase/firestore';

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

export const updateOrderStatus = async (orderId, { newStatus, cambioEstado }) => {
  try {
    const orderRef = doc(db, 'ordenes', orderId);
    
    await runTransaction(db, async (transaction) => {
      // Actualizar el estado principal
      transaction.update(orderRef, { 
        estado: newStatus 
      });
      
      // Agregar al historial de estados
      transaction.update(orderRef, {
        historialEstados: arrayUnion(cambioEstado)
      });
    });
    
    return await getDoc(orderRef);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};