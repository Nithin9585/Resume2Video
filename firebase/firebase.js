// Import the functions you need from the SDKs you need
import { initializeApp ,getApp,getApps} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBCVAUK7HFqgJdjOPZWlWvokY9qIdFyNRg",
  authDomain: "resume2video-e3023.firebaseapp.com",
  projectId: "resume2video-e3023",
  storageBucket: "resume2video-e3023.firebasestorage.app",
  messagingSenderId: "157136045061",
  appId: "1:157136045061:web:a25ccb12812d3f3b56486c",
  measurementId: "G-284L3DKFKY"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);
export {auth,firestore,app};
