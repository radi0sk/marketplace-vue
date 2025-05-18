// main.js (versión corregida)
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from './store';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import { auth, db } from "@/services/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import '@/assets/toast.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCartPlus, faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faMoneyBillWave, faHandHoldingUsd, faUniversity } from '@fortawesome/free-solid-svg-icons'

// Primero agregamos los iconos a la biblioteca de Font Awesome
library.add(faCartPlus, faCheckCircle, faSpinner, faMoneyBillWave, faHandHoldingUsd, faUniversity);

// Luego creamos la aplicación
const app = createApp(App);

// Registramos el componente FontAwesomeIcon
app.component('font-awesome-icon', FontAwesomeIcon);

// Configuración de Toast
app.use(Toast, {  // Configuración única
  position: "top-center",
  timeout: 3594,
  draggable: true,
  draggablePercent: 0.72,
  closeOnClick: true,
  pauseOnFocusLoss: false,
  icon: {
    iconClass: 'fas fa-cart-plus', // Usa Font Awesome (ya configurado)
    iconTag: 'i'
  }
});

app.use(router);
app.use(store);
app.mount("#app");

// Firebase Auth
auth.onAuthStateChanged((user) => {
  if (user) {
    updateDoc(doc(db, "users", user.uid), {
      visitCount: increment(1),
    });
  }
});