import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthUserProvider } from './screens/GLOBAL/contexts/AuthUserContext';
// auth and homepages
import Login from './screens/auth/Login';
import Signup from './screens/auth/Signup';
import Homepage from './screens/homepage/Homepage';
// product pages

export default function App() {
	return (
		<Router>
			<div className='App'>
				<AuthUserProvider>
					<Routes>
						<Route
							path='/signup'
							element={<Signup />}
						/>
						<Route
							path='/login'
							element={<Login />}
						/>
						<Route
							path='/'
							element={<Homepage />}
						/>
					</Routes>
				</AuthUserProvider>
			</div>
		</Router>
	);
}
