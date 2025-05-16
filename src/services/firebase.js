import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAVt6oeba-AhgDDeBGwavtGGm8YuFJLeb0",
  authDomain: "celularesatitlan.firebaseapp.com",
  projectId: "celularesatitlan",
  storageBucket: "celularesatitlan.firebasestorage.app",
  messagingSenderId: "152160171843",
  appId: "1:152160171843:web:98ecd15b969327cc3f21f6",
  measurementId: "G-F3Z56CL7W6",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Configura Firestore y Autenticación
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Exporta todo lo necesario
export { db, auth, googleProvider };