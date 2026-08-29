import { ref, onUnmounted } from 'vue';
import { db } from '@/services/firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';

export interface Testimonial {
  id: string;
  author: string;
  message: string;
  fecha?: any;
  approved?: boolean;
}

export function useTestimonials() {
  const testimonials = ref<Testimonial[]>([]);
  const loading = ref(true);

  const testimonialsCollection = collection(db, 'testimonials');
  const q = query(
    testimonialsCollection, 
    where('approved', '==', true)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    testimonials.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Testimonial));
    loading.value = false;
  }, (error) => {
    console.error("Error fetching testimonials:", error);
    loading.value = false;
  });

  onUnmounted(() => {
    unsubscribe();
  });

  return { testimonials, loading };
}
