// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAijFh_QNSmaoHvQAIi_Cef_hT8XycevX0",
  authDomain: "metafinder-3cb93.firebaseapp.com",
  projectId: "metafinder-3cb93",
  storageBucket: "metafinder-3cb93.firebasestorage.app",
  messagingSenderId: "721468487477",
  appId: "1:721468487477:web:ec7920c6ea62a1ee847e7c",
  measurementId: "G-N0HC3Q4ETN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);
// Initialize Storage
const storage = getStorage(app);

export { db, storage };
