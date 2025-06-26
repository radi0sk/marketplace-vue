<template>
  <div class="review-dialog-overlay">
    <div class="review-dialog">
      <button class="close-btn" @click="$emit('close')">
        &times;
      </button>

      <h3>¡Valora tu experiencia!</h3>
      <p class="subtitle">Tu opinión nos ayuda a mejorar</p>

      <div class="rating-section">
        <h4>Calificación general</h4>
        <div class="star-rating">
          <span
            v-for="star in 5"
            :key="star"
            @click="setRating(star)"
            @mouseover="hoverRating = star"
            @mouseleave="hoverRating = 0"
            :class="{
              'star': true,
              'filled': star <= (hoverRating || rating),
              'active': star <= hoverRating && hoverRating !== 0
            }"
          >
            &#9733;
          </span>
        </div>
        <p class="rating-text">{{ ratingText }}</p>
      </div>

      <div class="category-ratings">
        <div class="category" v-for="category in categories" :key="category.id">
          <h4>{{ category.label }}</h4>
          <div class="star-rating small">
            <span
              v-for="star in 5"
              :key="star"
              @click="setCategoryRating(category.id, star)"
              :class="{
                'star': true,
                'filled': star <= categoryRatings[category.id],
                'small': true
              }"
            >
              &#9733;
            </span>
          </div>
        </div>
      </div>

      <div class="review-section">
        <h4>Cuéntanos más</h4>
        <textarea
          v-model="reviewText"
          placeholder="¿Qué te gustó más? ¿Qué podríamos mejorar?"
          rows="4"
          maxlength="500"
        ></textarea>
        <p class="char-count">{{ reviewText.length }}/500 caracteres</p>
      </div>

      <div class="recommend-section">
        <h4>¿Recomendarías nuestra tienda?</h4>
        <div class="recommend-options">
          <label>
            <input type="radio" v-model="wouldRecommend" value="yes">
            <span>Sí, definitivamente</span>
          </label>
          <label>
            <input type="radio" v-model="wouldRecommend" value="maybe">
            <span>Tal vez</span>
          </label>
          <label>
            <input type="radio" v-model="wouldRecommend" value="no">
            <span>No</span>
          </label>
        </div>
      </div>

      <div class="dialog-actions">
        <button
          @click="submitReview"
          class="submit-btn"
          :disabled="!canSubmit"
        >
          Enviar reseña
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { doc, setDoc, collection } from "firebase/firestore";
import { db, auth } from "@/services/firebase";
import { mapState } from 'vuex';
import { useToast } from "vue-toastification";

export default {
  props: ['orderId'],
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      rating: 0,
      hoverRating: 0,
      reviewText: '',
      wouldRecommend: '',
      categoryRatings: {
        productQuality: 0,
        delivery: 0,
        customerService: 0,
        price: 0
      },
      categories: [
        { id: 'customerService', label: 'Atención al cliente' },
        { id: 'price', label: 'Relación precio-calidad' }
      ]
    }
  },
  computed: {
    ...mapState(['user']),
    userDisplayName() {
      if (!this.user) return 'Anónimo';
      return this.user.displayName || this.user.name || 'Anónimo';
    },
    ratingText() {
      const texts = [
        'Selecciona una calificación',
        'Malo',
        'Regular',
        'Bueno',
        'Muy bueno',
        'Excelente'
      ];
      return texts[this.hoverRating || this.rating];
    },
    canSubmit() {
      return this.rating > 0 &&
             this.reviewText.trim().length >= 10 &&
             this.reviewText.trim().length <= 500 &&
             this.wouldRecommend !== '';
    }
  },
  methods: {
    setRating(star) {
      this.rating = star;
    },
    setCategoryRating(categoryId, star) {
      this.categoryRatings[categoryId] = star;
    },
    async submitReview() {
      try {
        if (!this.canSubmit) {
          this.toast.error('Por favor, completa todos los campos requeridos.');
          return;
        }

        const currentUser = auth.currentUser;
        const user = this.user || {};
        const userName = currentUser?.displayName || 
                         user.name || 
                         'Anónimo';
        const userEmail = currentUser?.email || user.email || '';
        const userId = currentUser?.uid || user.uid || null;

        const reviewRef = doc(collection(db, "testimonials"));

        await setDoc(reviewRef, {
          orderId: this.orderId,
          rating: this.rating,
          categoryRatings: this.categoryRatings,
          reviewText: this.reviewText.trim(),
          wouldRecommend: this.wouldRecommend,
          userName: userName,
          userEmail: userEmail,
          userId: userId,
          createdAt: new Date(),
          approved: false
        });

        this.$emit('close');
        this.toast.success('¡Gracias por tu reseña! La publicaremos después de revisarla.');
      } catch (error) {
        console.error("Error al guardar la reseña:", error);
        this.toast.error('Ocurrió un error al guardar tu reseña. Por favor, inténtalo de nuevo.');
      }
    }
  }
}
</script>
<style scoped>
/* Tu CSS existente */
.review-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.review-dialog {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  position: relative;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
}

h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  text-align: center;
}

.subtitle {
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 2rem;
}

.rating-section {
  margin-bottom: 1.5rem;
  text-align: center;
}

.star-rating {
  display: inline-flex;
  margin: 0.5rem 0;
}

/* Estilos para los íconos de Font Awesome */
.star .fa-star,
.close-btn .fa-times,
.submit-btn .fa-paper-plane {
  /* Asegúrate de que Font Awesome no tenga estilos que los oculten */
  display: inline-block; /* O block si es necesario */
}


.star {
  font-size: 2rem;
  color: #ddd; /* Color por defecto de las estrellas no rellenadas */
  cursor: pointer;
  transition: all 0.2s;
  margin: 0 3px;
}

.star.small {
  font-size: 1.2rem;
}

.star.filled {
  color: #FFD700; /* Color de las estrellas rellenadas */
}

/* La estrella activa (hover) */
.star.active {
  transform: scale(1.2);
  color: #f7ce00; /* Un color ligeramente diferente para el hover si lo deseas */
}

.rating-text {
  color: #42b983;
  font-weight: bold;
  margin-top: 0.5rem;
}

.category-ratings {
  margin: 1.5rem 0;
}

.category {
  margin-bottom: 1rem;
}

.category h4 {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #555;
}

.review-section {
  margin: 1.5rem 0;
}

.review-section h4 {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #555;
}

textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box; /* Asegura que el padding no afecte el ancho total */
}

.char-count {
    font-size: 0.8rem;
    color: #7f8c8d;
    text-align: right;
    margin-top: 5px;
}

.recommend-section {
  margin: 1.5rem 0;
}

.recommend-section h4 {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #555;
}

.recommend-options {
  display: flex;
  gap: 1rem;
}

.recommend-options label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.dialog-actions {
  text-align: center;
  margin-top: 1.5rem;
}

.submit-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.submit-btn:hover {
  background-color: #3aa876;
}

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .review-dialog {
    padding: 1.5rem;
  }

  .star {
    font-size: 1.8rem;
  }

  .recommend-options {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>