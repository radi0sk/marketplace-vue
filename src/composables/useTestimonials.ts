import { ref, onUnmounted } from 'vue';
import { db } from '@/services/firebase';
import { collection, onSnapshot, limit } from 'firebase/firestore';

export interface Testimonial {
  id: string;
  author: string;
  message: string;
}

export function useTestimonials() {
  const testimonials = ref<Testimonial[]>([]);
  const loading = ref(true);

  const testimonialsCollection = collection(db, 'testimonials');

  const unsubscribe = onSnapshot(testimonialsCollection, (snapshot) => {
    testimonials.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Testimonial));
    loading.value = false;
  });

  onUnmounted(() => {
    unsubscribe();
  });

  return { testimonials, loading };
}
