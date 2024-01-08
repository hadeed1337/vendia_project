import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyDk8Bjf_qKA6SWAfNtbF99-Ww3m95aPbcE",
    authDomain: "vendia-project-1ab08.firebaseapp.com",
    databaseURL: "https://vendia-project-1ab08-default-rtdb.firebaseio.com",
    projectId: "vendia-project-1ab08",
    storageBucket: "vendia-project-1ab08.appspot.com",
    messagingSenderId: "527748930701",
    appId: "1:527748930701:web:4897cea3e0e0a3b232d6c4",
    measurementId: "G-T83F7C2CZS"
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };