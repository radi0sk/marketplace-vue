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
  increment 
} from 'firebase/firestore';
import type { Customer } from '@/types';

const CUSTOMERS_COLLECTION = 'customers';

export async function getCustomers(): Promise<Customer[]> {
  try {
    const ref = collection(db, CUSTOMERS_COLLECTION);
    const q = query(ref, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as Customer));
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Customer;
    }
    return null;
  } catch (error) {
    console.error('Error fetching customer:', error);
    return null;
  }
}

export async function addCustomer(customer: Omit<Customer, 'id'>): Promise<string> {
  const ref = collection(db, CUSTOMERS_COLLECTION);
  const now = new Date().toISOString();
  const docRef = await addDoc(ref, {
    ...customer,
    currentDebt: customer.currentDebt || 0,
    creditLimit: customer.creditLimit || 0,
    mainCrops: customer.mainCrops || [],
    createdAt: now,
    updatedAt: now
  });
  return docRef.id;
}

export async function updateCustomer(id: string, customer: Partial<Customer>): Promise<void> {
  const docRef = doc(db, CUSTOMERS_COLLECTION, id);
  await updateDoc(docRef, {
    ...customer,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteCustomer(id: string): Promise<void> {
  const docRef = doc(db, CUSTOMERS_COLLECTION, id);
  await deleteDoc(docRef);
}

export async function updateCustomerDebt(id: string, deltaAmount: number): Promise<void> {
  const docRef = doc(db, CUSTOMERS_COLLECTION, id);
  await updateDoc(docRef, {
    currentDebt: increment(deltaAmount),
    updatedAt: new Date().toISOString()
  });
}
