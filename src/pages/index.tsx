import RootLayout from '@/app/layout';
import ConnectForm from '@/components/ConnectForm';
import ScrapeForm from '@/components/ScrapeForm';
import CryptoJS from 'crypto-js';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY as string;

export default function Home() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [debouncedEmail] = useDebounce(email, 1000);
	const [debouncedPassword] = useDebounce(password, 1000);

	const [mode, setMode] = useState<'scrape' | 'connect'>('connect');

	useEffect(() => {
		const savedEmail = localStorage.getItem('email');
		const savedPassword = localStorage.getItem('password');

		if (savedEmail) setEmail(savedEmail);
		if (savedPassword) {
			const bytes = CryptoJS.AES.decrypt(savedPassword, SECRET_KEY);
			const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
			setPassword(originalPassword);
		}
	}, []);

	useEffect(() => {
		localStorage.setItem('email', debouncedEmail);
	}, [debouncedEmail]);

	useEffect(() => {
		if (debouncedPassword && SECRET_KEY) {
			const encryptedPassword = CryptoJS.AES.encrypt(
				debouncedPassword,
				SECRET_KEY
			).toString();
			localStorage.setItem('password', encryptedPassword);
		}
	}, [debouncedPassword]);

	return (
		<RootLayout>
			<div className='header'>
				<h1>LinkedIn Bot</h1>
				<div className='login'>
					<input
						type='text'
						placeholder='email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<input
						type='password'
						placeholder='password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>
			</div>
			{email && password && password.length > 6 && (
				<>
					<div className='modes'>
						<button onClick={() => setMode('connect')}>Connect</button>
						<button onClick={() => setMode('scrape')}>Scrape</button>
					</div>

					{mode === 'scrape' && (
						<ScrapeForm email={email} password={password} />
					)}
					{mode === 'connect' && (
						<ConnectForm email={email} password={password} />
					)}
				</>
			)}
		</RootLayout>
	);
}
