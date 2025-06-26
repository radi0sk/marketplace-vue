<template>
  <div id="contact-page">
   

    <main class="main-content">
      <section class="hero-section">
        <div class="container">
          <h1>Contáctanos</h1>
          <p>Estamos aquí para ayudarte. Ponte en contacto con nosotros.</p>
        </div>
      </section>

      <section class="contact-info">
        <div class="container">
          <h2>Información de Contacto</h2>
          <div class="info-cards">
            <div class="card">
              <h3>Dirección Principal</h3>
              <p>Cantón Panaj, Santiago Atitlán, Sololá, Guatemala</p>
            </div>
            <div class="card">
              <h3>Correo Electrónico</h3>
              <p><a href="mailto:pedrora3@gmail.com">pedrora3@gmail.com</a></p>
            </div>
            <div class="card">
              <h3>Teléfono</h3>
              <p><a href="tel:+50238465461">+502 3846 5461</a></p>
            </div>
            <div class="card">
              <h3>Marketplace</h3>
              <p>Encuéntranos en:</p>
              <p><a href="https://www.facebook.com/marketplace/profile/100000234655223/?ref=share_attachment" target="_blank">Facebook Marketplace</a></p>
            </div>
          </div>
        </div>
      </section>

      </main>

    
  </div>
</template>

<script>
export default {
  name: 'ContactPage',
};
</script>

<style scoped>
/* Paleta de Colores y Estilos Aplicados (reutilizados del componente de envíos) */
:root {
  --gris-suave: #F2F2F2;
  --azul-oscuro: #1F3A93;
  --azul-secundario: #002B5B;
  --blanco-puro: #FFFFFF;
  --negro-suave: #1C1C1C;
}

#contact-page {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Más elegante */
  line-height: 1.6;
  color: var(--negro-suave);
  background: linear-gradient(to bottom, var(--gris-suave), #e0e0e0); /* Degradado elegante */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header Mejorado (reutilizado) */
.header {
  background: var(--blanco-puro);
  padding: 1rem 0;
  border-bottom: none; /* Eliminar borde inferior */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05); /* Efecto de elevación */
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-container {
  background: linear-gradient(45deg, var(--azul-oscuro), var(--azul-secundario));
  border-radius: 12px; /* Contenedor redondeado */
  padding: 10px 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.logo-container:hover {
  transform: translateY(-3px); /* Efecto de elevación */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.logo-text {
  color: var(--blanco-puro);
  font-size: 1.8rem;
  font-weight: bold;
  letter-spacing: 1px; /* Espaciado optimizado */
}

.nav-links {
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
}

.nav-links li {
  margin-left: 25px; /* Espaciado optimizado */
}

.nav-link-item {
  text-decoration: none;
  color: var(--negro-suave);
  font-weight: 600; /* Más elegancia */
  padding: 8px 0;
  position: relative;
  transition: color 0.3s ease, transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.nav-link-item::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: 0;
  left: 0;
  background-color: var(--azul-oscuro);
  transition: width 0.3s ease;
}

.nav-link-item:hover {
  color: var(--azul-oscuro);
  transform: translateY(-2px); /* Efecto de elevación sutil */
}

.nav-link-item:hover::after {
  width: 100%;
}

.hero-section {
  background: linear-gradient(135deg, var(--azul-oscuro), var(--azul-secundario));
  color: var(--blanco-puro);
  padding: 5rem 0;
  text-align: center;
  border-radius: 0 0 50px 50px; /* Borde inferior redondeado */
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

.contact-info {
  padding: 3rem 0;
}

.contact-info h2 {
  text-align: center;
  margin-bottom: 2.5rem;
  color: var(--azul-oscuro);
  font-size: 2.5rem;
  font-weight: 700;
}

/* Diseño de Tarjetas Moderno (reutilizado) */
.info-cards {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 30px; /* Mayor espacio entre tarjetas */
}

.card {
  background: var(--blanco-puro);
  border: none;
  border-radius: 16px; /* Bordes redondeados más suaves */
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08); /* Sombras elegantes */
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); /* Animaciones fluidas */
  min-width: 280px;
  max-width: 380px;
  flex: 1;
  text-align: center;
}

.card:hover {
  transform: translateY(-10px) scale(1.03); /* Efectos de escala y elevación */
  box-shadow: 0 15px 40px rgba(0,0,0,0.15);
}

.card h3 {
  color: var(--azul-oscuro);
  margin-bottom: 1rem;
  font-size: 1.8rem;
  font-weight: 600;
}

.card p {
  font-size: 1.1rem;
  color: var(--negro-suave);
}

.card a {
  color: var(--azul-oscuro);
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s ease;
}

.card a:hover {
  color: var(--azul-secundario);
}

.footer {
  background: var(--negro-suave);
  color: var(--blanco-puro);
  text-align: center;
  padding: 2rem 0;
  margin-top: 4rem;
  font-size: 0.9rem;
}
</style>