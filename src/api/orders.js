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
  arrayUnion, updateDoc
} from 'firebase/firestore';


export const getOrders = async (status = null) => {
  try {
    let q = query(collection(db, 'ordenes'), orderBy('fecha', 'desc'));
    
    if (status) {
      q = query(q, where('estado', '==', status));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      let fecha;
      
      // Caso 1: Es un Timestamp de Firestore
      if (data.fecha?.toDate) {
        fecha = data.fecha.toDate();
      } 
      // Caso 2: Es un string ISO
      else if (typeof data.fecha === 'string') {
        fecha = new Date(data.fecha);
      }
      // Caso 3: Es un número (timestamp)
      else if (typeof data.fecha === 'number') {
        fecha = new Date(data.fecha);
      }
      // Caso 4: No existe o es inválido
      else {
        fecha = new Date();
      }
      
      return {
        id: doc.id,
        ...data,
        fecha: fecha
      };
    });
  } catch (error) {
    if (error.code === 'failed-precondition') {
      console.warn('Índice no encontrado, devolviendo array vacío');
      return [];
    }
    console.error('Error al obtener pedidos:', error);
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
    
    const data = orderSnap.data();
    let fecha;
    
    // Misma lógica de conversión de fecha que en getOrders
    if (data.fecha?.toDate) {
      fecha = data.fecha.toDate();
    } else if (typeof data.fecha === 'string') {
      fecha = new Date(data.fecha);
    } else if (typeof data.fecha === 'number') {
      fecha = new Date(data.fecha);
    } else {
      fecha = new Date();
    }
    
    return {
      id: orderSnap.id,
      ...data,
      fecha: fecha
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
      transaction.update(orderRef, { 
        estado: newStatus,
        historialEstados: arrayUnion(cambioEstado)
      });
    });
    
    return await getDoc(orderRef);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};
export const updateOrderTrackingInfo = async (orderId, trackingInfo) => {
  try {
    const orderRef = doc(db, 'ordenes', orderId);
    await updateDoc(orderRef, {
      numeroGuia: trackingInfo.numeroGuia || null, // Guarda el número de guía
      courier: trackingInfo.courier || null,       // Guarda la empresa de courier
      trackingURL: trackingInfo.trackingURL || null, // Guarda la URL de rastreo generada
      imagenGuiaURL: trackingInfo.imagenGuiaURL || null // Guarda la URL de la imagen
    });
    console.log(`Información de rastreo actualizada para la orden ${orderId}`);
  } catch (error) {
    console.error('Error al actualizar la información de rastreo:', error);
    throw error;
  }
};