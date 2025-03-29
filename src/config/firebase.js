import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: 'AIzaSyC0uE1rnNqcKd5FYI_EZDzFLJhRjSjItGY',
	authDomain: 'ez-consult-5c22c.firebaseapp.com',
	projectId: 'ez-consult-5c22c',
	storageBucket: 'ez-consult-5c22c.firebasestorage.app',
	messagingSenderId: '14136431523',
	appId: '1:14136431523:web:1c6b742ba8303aa0e50016',
	measurementId: 'G-E7VM73FJRM',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
