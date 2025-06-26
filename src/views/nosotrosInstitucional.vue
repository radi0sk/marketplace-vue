<template>
  <div id="about-us-page">
    <main class="main-content">
      <section class="hero-section">
        <div class="container">
          <h1>Sobre Nosotros</h1>
          <p>Comprometidos con el bienestar y la productividad de tu ganado, aves, porcinos y tilapias.</p>
        </div>
      </section>

      <section class="our-focus">
        <div class="container">
          <h2>Nuestro Enfoque</h2>
          <div class="focus-description">
            <p>Nos especializamos en la distribución y comercialización de productos de alta calidad para el sector pecuario en Guatemala. Nuestro compromiso es brindarte soluciones integrales que impulsen el crecimiento y la salud de tus animales.</p>
            <p>Ofrecemos una amplia gama de <strong>suplementos</strong>, tanto en <strong>concentrado como en alimento balanceado</strong>, diseñados específicamente para:</p>
            <ul>
              <li>Ganado Bovino</li>
              <li>Aves de Corral</li>
              <li>Porcinos</li>
              <li>Tilapias</li>
            </ul>
            <p>Además, contamos con una selección de <strong>medicamentos veterinarios</strong> esenciales para la prevención y tratamiento de enfermedades, asegurando la vitalidad de tus producciones.</p>
          </div>
        </div>
      </section>

      <section class="our-brands">
        <div class="container">
          <h2>Nuestras Marcas Destacadas</h2>
          <div class="brands-grid">
            <p v-if="loadingBrands">Cargando marcas...</p>
            <p v-else-if="errorLoadingBrands">Error al cargar las marcas: {{ errorLoadingBrands }}</p>
            <p v-else-if="brands.length === 0">No hay marcas disponibles en este momento.</p>

            <div class="brand-card" v-for="brand in brands" :key="brand.id">
              <img :src="brand.imageUrl" :alt="brand.name" class="brand-image">
              <h3>{{ brand.name }}</h3>
              <p class="brand-description">{{ brand.description }}</p>
              
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
// Importa las funciones necesarias de Firebase Firestore
import { collection, getDocs } from "firebase/firestore";
// Importa tu instancia de la base de datos de Firebase
import { db } from "@/services/firebase";

export default {
  name: 'NosotrosPage',
  data() {
    return {
      brands: [], // El array que contendrá las marcas cargadas desde Firestore
      loadingBrands: true, // Indicador de carga
      errorLoadingBrands: null, // Para almacenar cualquier error durante la carga
    };
  },
  async created() {
    // El hook 'created' es un buen lugar para cargar datos cuando el componente se crea.
    this.loadingBrands = true;
    this.errorLoadingBrands = null;
    try {
      // Obtener una referencia a la colección 'brands'
      const brandsCollectionRef = collection(db, "brands");
      // Obtener todos los documentos de la colección
      const querySnapshot = await getDocs(brandsCollectionRef);

      // Mapear los documentos para obtener los datos y su ID
      this.brands = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error al cargar las marcas desde Firestore:", error);
      this.errorLoadingBrands = error.message; // Almacena el mensaje de error para mostrarlo al usuario
    } finally {
      this.loadingBrands = false; // Finaliza el estado de carga
    }
  },
};
</script>

<style scoped>
/* Paleta de Colores y Estilos Aplicados (reutilizados del componente de envíos y contactos) */
:root {
  --gris-suave: #F2F2F2;
  --azul-oscuro: #1F3A93;
  --azul-secundario: #002B5B;
  --blanco-puro: #FFFFFF;
  --negro-suave: #1C1C1C;
}

#about-us-page {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: var(--negro-suave);
  background: linear-gradient(to bottom, var(--gris-suave), #e0e0e0); /* Degradado elegante */
  min-height: 100vh; /* Asegura que la página ocupe al menos la altura completa del viewport */
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.main-content {
  flex-grow: 1; /* Permite que el contenido principal ocupe el espacio disponible */
}

.hero-section {
  background: linear-gradient(135deg, var(--azul-oscuro), var(--azul-secundario));
  color: var(--blanco-puro);
  padding: 5rem 0;
  text-align: center;
  border-radius: 0 0 50px 50px;
  margin-bottom: 3rem;
}

.hero-section h1 {
  margin-bottom: 1rem;
  font-size: 3.5rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.hero-section p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.our-focus,
.our-brands {
  padding: 3rem 0;
}

.our-focus h2,
.our-brands h2 {
  text-align: center;
  margin-bottom: 2.5rem;
  color: var(--azul-oscuro);
  font-size: 2.5rem;
  font-weight: 700;
}

.focus-description {
  background: var(--blanco-puro);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  max-width: 800px;
  margin: 0 auto 3rem auto;
  text-align: left;
}

.focus-description p {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.focus-description ul {
  list-style: disc;
  padding-left: 25px;
  margin-bottom: 1rem;
}

.focus-description ul li {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.brands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  justify-items: center;
}

.brand-card {
  background: var(--blanco-puro);
  border: none;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand-card:hover {
  transform: translateY(-10px) scale(1.03);
  box-shadow: 0 15px 40px rgba(0,0,0,0.15);
}

.brand-image {
  max-width: 150px;
  height: auto;
  margin-bottom: 1.5rem;
  border-radius: 8px; /* Slightly rounded images */
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.brand-card h3 {
  color: var(--azul-oscuro);
  margin-bottom: 1rem;
  font-size: 1.8rem;
  font-weight: 600;
}

.brand-description {
  font-size: 1rem;
  color: var(--negro-suave);
  margin-bottom: 1.5rem;
  flex-grow: 1; /* Allows description to take available space */
}

.provider-link {
  display: inline-block;
  background: linear-gradient(45deg, var(--azul-oscuro), var(--azul-secundario));
  color: var(--blanco-puro);
  padding: 12px 25px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.provider-link:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.15);
}
</style>