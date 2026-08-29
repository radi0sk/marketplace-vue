import { db } from '@/services/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  increment,
  runTransaction 
} from 'firebase/firestore';
import type { Quote } from '@/types';
import { updateCustomerDebt } from './crmService';

const QUOTES_COLLECTION = 'quotes';
const ORDERS_COLLECTION = 'ordenes';
const PRODUCTS_COLLECTION = 'products';

export async function getQuotes(): Promise<Quote[]> {
  try {
    const ref = collection(db, QUOTES_COLLECTION);
    const q = query(ref, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as Quote));
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return [];
  }
}

export async function getQuoteById(id: string): Promise<Quote | null> {
  try {
    const docRef = doc(db, QUOTES_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Quote;
    }
    return null;
  } catch (error) {
    console.error('Error fetching quote:', error);
    return null;
  }
}

export async function addQuote(quote: Omit<Quote, 'id' | 'quoteNumber'>): Promise<string> {
  const ref = collection(db, QUOTES_COLLECTION);
  const now = new Date().toISOString();
  const quoteNumber = `COT-${Date.now().toString().slice(-6)}`;
  
  const docRef = await addDoc(ref, {
    ...quote,
    quoteNumber,
    status: quote.status || 'draft',
    createdAt: now,
    updatedAt: now
  });
  return docRef.id;
}

export async function updateQuote(id: string, quote: Partial<Quote>): Promise<void> {
  const docRef = doc(db, QUOTES_COLLECTION, id);
  await updateDoc(docRef, {
    ...quote,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteQuote(id: string): Promise<void> {
  const docRef = doc(db, QUOTES_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Converts an approved quote into an active sale order in `ordenes` collection,
 * decrements stock in `products` collection, and updates customer debt if Credit.
 */
export async function convertQuoteToSale(quoteId: string): Promise<string> {
  const quoteRef = doc(db, QUOTES_COLLECTION, quoteId);
  const quoteSnap = await getDoc(quoteRef);

  if (!quoteSnap.exists()) {
    throw new Error('La cotización no existe');
  }

  const quote = { id: quoteSnap.id, ...quoteSnap.data() } as Quote;

  if (quote.status === 'converted') {
    throw new Error('Esta cotización ya fue convertida en venta previamente');
  }

  const now = new Date().toISOString();
  const orderId = `ORD-${Date.now()}`;

  // Build items array for `ordenes` format
  const orderItems = quote.items.map(item => ({
    id: item.productId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    subtotal: item.subtotal,
    total: item.subtotal,
    metodoPago: quote.paymentMethod,
    recargo: 0
  }));

  const orderData = {
    id: orderId,
    cotizacionId: quoteId,
    cliente: {
      name: quote.customerName,
      telefono: quote.customerPhone || 'sin-telefono',
      email: 'venta-directa@agroguate.com'
    },
    direccion: {
      nombre: quote.customerName,
      direccion: 'Venta Directa / Cotización',
      departamento: 'Sololá',
      ciudad: 'Guatemala',
      codigoPostal: '07000'
    },
    items: orderItems,
    envio: 0,
    subtotal: quote.subtotal,
    descuento: quote.discountAmount || 0,
    total: quote.total,
    estado: 'completado',
    metodoPago: quote.paymentMethod,
    fecha: now,
    historialEstados: [
      {
        estadoNuevo: 'completado',
        fecha: now,
        usuario: {
          nombre: quote.createdByName || 'Asesor Comercial',
          email: 'asesor@agroguate.com'
        }
      }
    ]
  };

  // Run batch/transaction or write order & update stock
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);

  await runTransaction(db, async (transaction) => {
    // 1. Create order
    transaction.set(orderRef, orderData);

    // 2. Decrement stock for each product
    for (const item of quote.items) {
      const prodRef = doc(db, PRODUCTS_COLLECTION, item.productId);
      transaction.update(prodRef, {
        stock: increment(-item.quantity)
      });
    }

    // 3. Mark quote as converted
    transaction.update(quoteRef, {
      status: 'converted',
      convertedOrderId: orderId,
      updatedAt: now
    });
  });

  // 4. If credit purchase, add to customer's current debt in CRM
  if (quote.paymentMethod === 'credito' && quote.customerId) {
    try {
      await updateCustomerDebt(quote.customerId, quote.total);
    } catch (e) {
      console.warn('Could not update customer debt:', e);
    }
  }

  return orderId;
}
