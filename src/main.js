import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from './store';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import { auth, db } from "@/services/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCartPlus, faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Configuración de iconos
library.add(faCartPlus, faCheckCircle, faSpinner);

const app = createApp(App);

// Configuración de Toast (simplificada y más robusta)
app.use(Toast, {
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: false,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: true,
  hideProgressBar: false,
  icon: true
});

// Componentes globales
app.component('font-awesome-icon', FontAwesomeIcon);

// Plugins
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