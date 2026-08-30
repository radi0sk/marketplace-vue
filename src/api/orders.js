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


export const getOrders = async (status = null, vendorId = null) => {
  try {
    let q = query(collection(db, 'ordenes'), orderBy('fecha', 'desc'));
    
    if (status) {
      q = query(q, where('estado', '==', status));
    }

    if (vendorId) {
      q = query(q, where('vendorIds', 'array-contains', vendorId));
    }
    
    let querySnapshot = await getDocs(q);
    let docs = querySnapshot.docs;

    // Fallback si la consulta array-contains devolvió 0 por ser orden previa
    if (vendorId && docs.length === 0) {
      const allSnap = await getDocs(collection(db, 'ordenes'));
      docs = allSnap.docs.filter(d => {
        const data = d.data();
        const vIds = data.vendorIds || [];
        const items = data.items || [];
        const matchesVendor = vIds.includes(vendorId) || 
               data.vendorId === vendorId || 
               items.some((item) => item.vendorId === vendorId || item.affiliateVendorId === vendorId);
        const matchesStatus = !status || data.estado === status;
        return matchesVendor && matchesStatus;
      });
    }

    return docs.map(doc => {
      const data = doc.data();
      let fecha;
      
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
        id: doc.id,
        ...data,
        fecha: fecha
      };
    });
  } catch (error) {
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.warn('Índice no encontrado en Firestore, ejecutando filtrado en memoria...');
      try {
        const allSnap = await getDocs(collection(db, 'ordenes'));
        let docs = allSnap.docs.filter(d => {
          const data = d.data();
          const vIds = data.vendorIds || [];
          const items = data.items || [];
          const matchesVendor = !vendorId || 
                 vIds.includes(vendorId) || 
                 data.vendorId === vendorId || 
                 items.some((item) => item.vendorId === vendorId || item.affiliateVendorId === vendorId);
          const matchesStatus = !status || data.estado === status;
          return matchesVendor && matchesStatus;
        });

        // Ordenar por fecha descendente
        docs.sort((a, b) => {
          const fA = new Date(a.data().fecha || 0).getTime();
          const fB = new Date(b.data().fecha || 0).getTime();
          return fB - fA;
        });

        return docs.map(doc => {
          const data = doc.data();
          let fecha;
          if (data.fecha?.toDate) {
            fecha = data.fecha.toDate();
          } else if (data.fecha) {
            fecha = new Date(data.fecha);
          } else {
            fecha = new Date();
          }
          return {
            id: doc.id,
            ...data,
            fecha: fecha
          };
        });
      } catch (fallbackErr) {
        console.error('Error en fallback de órdenes:', fallbackErr);
        return [];
      }
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