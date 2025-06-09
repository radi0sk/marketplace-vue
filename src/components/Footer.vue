<template>
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>Contacto</h3>
          <p>Email: pedrora3@gmail.com</p>
          <p>Teléfono: +502 3846 5461</p>
        </div>
        <div class="footer-section">
          <h3>Redes Sociales</h3>
          <ul class="social-links">
            <li>
              <a href="https://www.facebook.com/profile.php?id=61562277812775" target="_blank" rel="noopener">Facebook</a>
            </li>
            <li>
              <a href="https://maps.app.goo.gl/utG8hxwFetQzPszVA" target="_blank" rel="noopener">Maps</a>
            </li>
          
          </ul>
        </div>
        <div class="footer-section">
          <h3>Enlaces Rápidos</h3>
          <ul class="quick-links">
            <li>
              <router-link to="/">Inicio</router-link>
            </li>
            <li>
              <router-link to="/cart">Carrito</router-link>
            </li>
            
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2023 Marketplace. Todos los derechos reservados.</p>
      </div>
    </footer>
  </template>
  
  <script>
  export default {
    name: "AppFooter",
    data() {
      return {
        currentYear: new Date().getFullYear()
      };
    },
    methods: {
      showContactNotification() {
        this.$root.$emit('show-notification', {
          message: 'Pronto nos pondremos en contacto contigo',
          type: 'info'
        });
      }
    }
  };
  </script>
  
  <style scoped>
  .footer {
    background-color: #2c3e50;
    color: white;
    padding: 2rem 0;
    margin-top: auto; /* Para que el footer se quede abajo */
  }
  
  .footer-content {
    display: flex;
    justify-content: space-around;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  .footer-section {
    flex: 1;
    margin: 0 1rem;
  }
  
  .footer-section h3 {
    margin-bottom: 1rem;
    font-size: 1.25rem;
  }
  
  .footer-section p,
  .footer-section a {
    color: white;
    text-decoration: none;
  }
  
  .footer-section a:hover {
    text-decoration: underline;
  }
  
  .social-links,
  .quick-links {
    list-style: none;
    padding: 0;
  }
  
  .social-links li,
  .quick-links li {
    margin-bottom: 0.5rem;
  }
  
  .footer-bottom {
    text-align: center;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #444;
  }
  </style>