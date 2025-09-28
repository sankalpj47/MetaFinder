// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {getAuth} from "firebase/auth"
import { createUserWithEmailAndPassword } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAijFh_QNSmaoHvQAIi_Cef_hT8XycevX0",
  authDomain: "metafinder-3cb93.firebaseapp.com",
  projectId: "metafinder-3cb93",
  storageBucket: "metafinder-3cb93.firebasestorage.app",
  messagingSenderId: "721468487477",
  appId: "1:721468487477:web:ec7920c6ea62a1ee847e7c",
  measurementId: "G-N0HC3Q4ETN"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const authi=getAuth(app);


const signup = async (email, password,name , phone) => {
  const userC = await createUserWithEmailAndPassword(authi, email, password);
  await updateProfile(userC.user,{displayName:name});

  await setDoc(doc(db, "users", userC.user.uid), {
    name: name,
    email: email,
    phone: phone
  });
}

const login = (email, password) => {
  return signInWithEmailAndPassword(authi, email, password);
};

export { db, storage , authi ,login, signup};
