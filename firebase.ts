// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDRY6Ow5XcgyVyxhvzTizW5yQjlTHlYvnM',
  authDomain: 'netflix-clone-react-146be.firebaseapp.com',
  projectId: 'netflix-clone-react-146be',
  storageBucket: 'netflix-clone-react-146be.appspot.com',
  messagingSenderId: '34257695483',
  appId: '1:34257695483:web:82d4d8fc2b6ba038a0b65e',
};

// Initialize Firebase
let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db: Firestore = getFirestore(app);

export { db };
