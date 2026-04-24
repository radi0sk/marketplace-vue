import { ref, onUnmounted } from 'vue';
import { db } from '@/services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export interface Category {
  id: string;
  name: string;
  image: string;
}

export function useCategories() {
  const categories = ref<Category[]>([]);
  const loading = ref(true);

  const categoriesCollection = collection(db, 'categories');

  const unsubscribe = onSnapshot(categoriesCollection, (snapshot) => {
    categories.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Category));
    loading.value = false;
  });

  onUnmounted(() => {
    unsubscribe();
  });

  return { categories, loading };
}
