import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

// create context
const AuthUserContext = createContext();

// Custom hook to use UserProvider
export const useAuthUser = () => {
	return useContext(AuthUserContext);
};

// UserProvider component
export const AuthUserProvider = ({ children }) => {
	const [user, setUser] = useState(null);

	// Fetch user details from Firebase
	const fetchUser = async () => {
		auth.onAuthStateChanged(async (currUser) => {
			if (currUser) {
				try {
					const userDoc = doc(db, 'Users', currUser.uid);
					const docSnapshot = await getDoc(userDoc);
					const userData = docSnapshot.data();
					setUser({
						...userData,
					});
					console.log('User successfully fetched:', currUser);
				} catch (err) {
					console.error('Error fetching user:', err.message);
				}
			} else {
				console.log('No user logged in');
				setUser(null);
			}
		});
	};

	// Fetch user on component mount
	useEffect(() => {
		fetchUser();
	}, []);

	// Value object for context provider
	const value = { user, setUser };

	return <AuthUserContext.Provider value={value}>{children}</AuthUserContext.Provider>;
};