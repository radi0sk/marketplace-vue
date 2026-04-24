import { ref, onUnmounted } from 'vue';
import { db } from '@/services/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import type { Product } from '@/types';

export function useProducts() {
  const products = ref<Product[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const productsCollection = collection(db, 'products');
  const q = query(productsCollection, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    products.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
    loading.value = false;
  }, (err) => {
    console.error('Error fetching products:', err);
    error.value = 'Error al cargar productos';
    loading.value = false;
  });

  onUnmounted(() => {
    unsubscribe();
  });

  return { products, loading, error };
}
