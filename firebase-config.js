// Config web pública de Firebase — no es secreta (la protección real son las
// Firestore Rules). Proyecto compartido temporalmente con ajedrez-16bit;
// todo lo de Olimpo vive en colecciones con prefijo "olimpo_" para no
// chocar con nada del ajedrez. Mover a un Firebase propio de Jose es solo
// cambiar este archivo.
export const firebaseConfig = {
  apiKey: "AIzaSyDhgcJD8qacDM3V5CoMbfl40FSI6fMXjnc",
  authDomain: "elmultiversodelajedrez.firebaseapp.com",
  databaseURL: "https://elmultiversodelajedrez-default-rtdb.firebaseio.com",
  projectId: "elmultiversodelajedrez",
  storageBucket: "elmultiversodelajedrez.firebasestorage.app",
  messagingSenderId: "444834597998",
  appId: "1:444834597998:web:4f3cb8677658400ea62a7f",
  measurementId: "G-2QZX57RJ1C"
};
