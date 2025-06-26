<template>
  <section class="payment-options">
    <div class="container">
      <h1 class="main-title">Formas de Pago</h1>

      <div class="payment-grid">
        <div 
          v-for="(payment, index) in payments" 
          :key="payment.title" 
          class="payment-card"
          :class="{ 'reverse': index % 2 === 1 }"
        >
          <!-- Imagen -->
          <div class="image-container">
            <img :src="payment.image" :alt="payment.title" class="payment-image">
            <div class="image-overlay"></div>
          </div>

          <!-- Descripción -->
          <div class="content-container">
            <h2 class="payment-title">{{ payment.title }}</h2>
            <p class="payment-description">{{ payment.description }}</p>
            <div class="accent-line"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const payments = [
  {
    title: "Tarjeta de Crédito o Débito (VISA)",
    image: "https://res.cloudinary.com/drpa7s0kq/image/upload/v1750895349/home_003_light_h9rqvx.png",
    description: "Aceptamos tarjetas VISA y Mastercard para pagos seguros y rápidos desde nuestra plataforma."
  },
  {
    title: "Transferencia Bancaria o Efectivo",
    image: "https://res.cloudinary.com/drpa7s0kq/image/upload/v1750895407/home_005_light_i4a9ys.png",
    description: "Puedes pagar por medio de transferencia bancaria o depósitos en efectivo. Te enviaremos los datos al finalizar tu pedido."
  },
  {
    title: "Pago Contra Entrega",
    image: "https://res.cloudinary.com/drpa7s0kq/image/upload/v1750895519/neopos_002_kzpomk.png",
    description: "Paga al recibir tu producto. Aplica un recargo adicional del 7% sobre el valor total de la compra."
  },
  {
    title: "NeoCuotas",
    image: "https://res.cloudinary.com/drpa7s0kq/image/upload/v1750895304/neocuotas_002_obo830.png",
    description: `Ofrece pagos a plazos de 2, 3, 6, 10, 12 y 18 cuotas.\n- Cuotas sin intereses para tus clientes.\n- Recibes el total de la venta al día siguiente.\n- Programa respaldado por los principales bancos.`
  },
  {
    title: "NeoLink",
    image: "https://res.cloudinary.com/drpa7s0kq/image/upload/v1750895211/neolink_002_tj9w81.png",
    description: `Permite pagos a distancia con tarjeta VISA o Mastercard.\n- Enlaces de pago personalizados y seguros.\n- Compatible con NeoCuotas y NeoPuntos.\n- Controla tus ventas desde una plataforma administrativa.\n- Click to Pay mejora la experiencia de pago online.`
  }
];
</script>

<style scoped>
/* Variables CSS para colores */
.payment-options {
  --primary-color: #1F3A93;
  --primary-dark: #002B5B;
  --primary-light: #3d5bb8;
  --background-color: #F2F2F2;
  --white: #FFFFFF;
  --text-primary: #1C1C1C;
  --text-secondary: #4a4a4a;
  --text-muted: #6b6b6b;
  --gray-light: #e8e8e8;
  --gray-medium: #d4d4d4;
  --shadow-light: 0 2px 4px 0 rgba(31, 58, 147, 0.1), 0 1px 2px 0 rgba(0, 43, 91, 0.06);
  --shadow-medium: 0 4px 8px -1px rgba(31, 58, 147, 0.15), 0 2px 4px -1px rgba(0, 43, 91, 0.08);
  --shadow-large: 0 12px 20px -3px rgba(31, 58, 147, 0.2), 0 4px 8px -2px rgba(0, 43, 91, 0.1);
  --gradient-primary: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  --gradient-background: linear-gradient(135deg, var(--background-color) 0%, #e6e6e6 100%);
}

.payment-options {
  background: var(--gradient-background);
  min-height: 100vh;
  padding: 4rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.main-title {
  font-size: 3rem;
  font-weight: 800;
  text-align: center;
  color: var(--text-primary);
  margin-bottom: 4rem;
  position: relative;
  letter-spacing: -0.02em;
}

.main-title::after {
  content: '';
  position: absolute;
  bottom: -1rem;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: var(--gradient-primary);
  border-radius: 2px;
}

.payment-grid {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.payment-card {
  display: flex;
  background: var(--white);
  border-radius: 20px;
  box-shadow: var(--shadow-large);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--gray-light);
}

.payment-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 35px -5px rgba(31, 58, 147, 0.25), 0 12px 15px -5px rgba(0, 43, 91, 0.15);
}

.payment-card.reverse {
  flex-direction: row-reverse;
}

.image-container {
  flex: 1;
  position: relative;
  min-height: 300px;
  overflow: hidden;
}

.payment-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.payment-card:hover .payment-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(31, 58, 147, 0.1) 0%, rgba(0, 43, 91, 0.15) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.payment-card:hover .image-overlay {
  opacity: 1;
}

.content-container {
  flex: 1;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.payment-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.payment-description {
  font-size: 1.1rem;
  color: var(--text-secondary);
  line-height: 1.7;
  white-space: pre-line;
  margin-bottom: 1.5rem;
}

.accent-line {
  width: 60px;
  height: 3px;
  background: var(--gradient-primary);
  border-radius: 2px;
  margin-top: auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .payment-options {
    padding: 2rem 0;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .main-title {
    font-size: 2.5rem;
    margin-bottom: 2.5rem;
  }
  
  .payment-grid {
    gap: 2rem;
  }
  
  .payment-card,
  .payment-card.reverse {
    flex-direction: column;
  }
  
  .image-container {
    min-height: 250px;
  }
  
  .content-container {
    padding: 2rem;
  }
  
  .payment-title {
    font-size: 1.5rem;
  }
  
  .payment-description {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .main-title {
    font-size: 2rem;
  }
  
  .content-container {
    padding: 1.5rem;
  }
  
  .payment-title {
    font-size: 1.25rem;
  }
  
  .payment-description {
    font-size: 0.95rem;
  }
}

/* Animaciones adicionales */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.payment-card {
  animation: slideInUp 0.6s ease-out;
}

.payment-card:nth-child(2) {
  animation-delay: 0.1s;
}

.payment-card:nth-child(3) {
  animation-delay: 0.2s;
}

.payment-card:nth-child(4) {
  animation-delay: 0.3s;
}

.payment-card:nth-child(5) {
  animation-delay: 0.4s;
}

/* Efectos de focus para accesibilidad */
.payment-card:focus-within {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
</style>