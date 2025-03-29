import React, { useState } from 'react';
import { auth, db } from '../../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import '../styles/Signup.css';

export default function Signup() {
	const [userName, setUserName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	// processing signup
	const handleSignup = async (e) => {
		e.preventDefault();
		try {
			const cred = await createUserWithEmailAndPassword(auth, email, password);
			const userDoc = doc(db, 'Users', cred.user.uid);
			await setDoc(userDoc, {
				userID: cred.user.uid,
				userName: userName,
				email: email,
				password: password,
			});
			setUserName('');
			setEmail('');
			setPassword('');
			setError('');
			window.location.href = '/login';
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<>
			<div className='container'>
				<br />
				<h2>Signup</h2>
				<br />
				<form
					autoComplete='off'
					className='form-group'
					onSubmit={handleSignup}>
					<label
						htmlFor='name'
						className='form-label'>
						Username
					</label>
					<input
						type='text'
						id='username'
						className='form-control'
						placeholder='Enter username'
						onChange={(e) => setUserName(e.target.value)}
						value={userName}
						required
					/>
					<br />
					<label
						htmlFor='email'
						className='form-label'>
						Email
					</label>
					<input
						type='email'
						id='email'
						className='form-control'
						placeholder='Enter email'
						onChange={(e) => setEmail(e.target.value)}
						value={email}
						required
					/>
					<br />
					<label
						htmlFor='password'
						className='form-label'>
						Password
					</label>
					<input
						type='password'
						id='password'
						className='form-control'
						placeholder='Enter password'
						required
						onChange={(e) => setPassword(e.target.value)}
						value={password}
					/>
					<br />
					<button
						type='submit'
						className='btn btn-success btn-md mybtn'>
						SUBMIT
					</button>
				</form>
				{error && <span className='error-msg'>{error}</span>}
				<br />
				<span>
					Already have an account? Login
					<a href='./login'> Here</a>;
				</span>
			</div>
		</>
	);
}
