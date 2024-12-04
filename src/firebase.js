// Importation de Firebase et des modules nécessaires
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';  // Ajout pour Firebase Storage si nécessaire

// Configuration Firebase (à remplacer par vos propres données)
const firebaseConfig = {
  apiKey: "AIzaSyCJ1pkmmrLEQkF-c-VlSrqHhXiQ2vtc-Oc",
  authDomain: "holabazaar-2771d.firebaseapp.com",
  projectId: "holabazaar-2771d",
  storageBucket: "holabazaar-2771d.appspot.com",
  messagingSenderId: "531615062682",
  appId: "1:531615062682:web:f322bfecc5116ed7769d23",
  measurementId: "G-Y7256R02YZ"
};

// Initialiser Firebase (avec vérification si déjà initialisé)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);  // Initialisation seulement si Firebase n'est pas déjà initialisé
} else {
  firebase.app();  // Si Firebase est déjà initialisé, on l'utilise sans réinitialiser
}

// Initialiser Firestore et Auth
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();  // Ajout du service Firebase Storage si nécessaire

// Exporter les services que vous allez utiliser
export { db, auth, storage };
