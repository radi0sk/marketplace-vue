import { createApp } from "vue";
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from "./App.vue";
import router from "./router";
import Toast from 'vue-toastification';

// Plugins and Styles
import 'vue-toastification/dist/index.css';
import './assets/main.css';

// Firebase
import { auth, db } from "@/services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";

// FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faCartPlus, 
  faCheckCircle, 
  faSpinner,
  faHeart, 
  faShoppingCart, 
  faSearch, 
  faEye,
  faCalendarAlt,
  faThLarge,
  faTag,
  faHome,
  faUser,
  faEnvelope,
  faPhone,
  faPaperPlane,
  faCaretDown,
  faStar,
  faSignOutAlt,
  faTrashAlt,
  faCamera,
  faUniversity,
  faInfoCircle,
  faHandHoldingUsd,
  faTruck,
  faHandshake,
  faImage,
  faTimes,
  faTrash,
  faCloudUploadAlt,
  faLink,
  faCertificate,
  faChartLine,
  faUserCircle,
  faQuoteLeft,
  faArrowRight,
  faChevronRight,
  faChevronLeft,
  faPlus,
  faEdit,
  faStore,
  faBoxes,
  faShoppingBag,
  faUsersCog,
  faChartPie,
  faCog,
  faRobot,
  faSeedling,
  faWallet,
  faHistory,
  faQuestionCircle,
  faBox,
  faExternalLinkAlt,
  faFlask,
  faCheck,
  faFileInvoiceDollar,
  faUsers,
  faUserPlus,
  faShareAlt,
  faClipboardList,
  faCalculator,
  faFilePdf,
  faFileAlt,
  faFilter,
  faTags,
  faCheckSquare,
  faUserEdit,
  faAddressBook,
  faTractor,
  faCopy,
  faFileExcel,
  faCloudDownloadAlt,
  faTable,
  faUpload
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { 
  faFacebook,
  faInstagram,
  faTwitter,
  faWhatsapp,
  faGoogle
} from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(
  faCartPlus as any, 
  faCheckCircle as any, 
  faSpinner as any, 
  faHeart as any, 
  farHeart as any,
  faShoppingCart as any, 
  faSearch as any,
  faEye as any,
  faCalendarAlt as any,
  faThLarge as any,
  faTag as any,
  faHome as any,
  faUser as any,
  faEnvelope as any,
  faPhone as any,
  faPaperPlane as any,
  faCaretDown as any,
  faStar as any,
  faFacebook as any, 
  faInstagram as any, 
  faTwitter as any,
  faWhatsapp as any,
  faGoogle as any,
  faSignOutAlt as any,
  faTrashAlt as any,
  faCamera as any,
  faUniversity as any,
  faInfoCircle as any,
  faHandHoldingUsd as any,
  faTruck as any,
  faHandshake as any,
  faImage as any,
  faTimes as any,
  faTrash as any,
  faCloudUploadAlt as any,
  faLink as any,
  faCertificate as any,
  faChartLine as any,
  faUserCircle as any,
  faQuoteLeft as any,
  faArrowRight as any,
  faChevronRight as any,
  faChevronLeft as any,
  faPlus as any,
  faEdit as any,
  faStore as any,
  faBoxes as any,
  faShoppingBag as any,
  faUsersCog as any,
  faChartPie as any,
  faCog as any,
  faRobot as any,
  faSeedling as any,
  faWallet as any,
  faHistory as any,
  faQuestionCircle as any,
  faBox as any,
  faExternalLinkAlt as any,
  faFlask as any,
  faCheck as any,
  faFileInvoiceDollar as any,
  faUsers as any,
  faUserPlus as any,
  faShareAlt as any,
  faClipboardList as any,
  faCalculator as any,
  faFilePdf as any,
  faFileAlt as any,
  faFilter as any,
  faTags as any,
  faCheckSquare as any,
  faUserEdit as any,
  faAddressBook as any,
  faTractor as any,
  faCopy as any,
  faFileExcel as any,
  faCloudDownloadAlt as any,
  faTable as any,
  faUpload as any
);

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
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

app.component('font-awesome-icon', FontAwesomeIcon);

app.mount("#app");

// Global Auth Tracking
onAuthStateChanged(auth, (user) => {
  if (user) {
    updateDoc(doc(db, "users", user.uid), {
      visitCount: increment(1),
    });
  }
});