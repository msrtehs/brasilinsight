
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Substitua pelos dados do seu projeto no Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBRdZwaTqGJuvdklkJSPDD0RmVs69Mvd0Q",
  authDomain: "brasilinsight-5451b.firebaseapp.com",
  projectId: "brasilinsight-5451b",
  storageBucket: "brasilinsight-5451b.firebasestorage.app",
  messagingSenderId: "677922667825",
  appId: "1:677922667825:web:583ea5f2b6eb99a5970410",
  measurementId: "G-BMX1SN280L"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
