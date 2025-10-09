import type { Metadata } from 'next'

import Auth from './Auth'

export const metadata: Metadata = {
	title: 'Войти',
	robots: {
		index: false,
		follow: false
	}
}

export default function AuthPage() {
	return <Auth />
}
