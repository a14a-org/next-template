import NextAuth from 'next-auth'
import Resend from 'next-auth/providers/resend'
import { getDb } from '@/db/client'
import { BunSQLAdapter } from './auth-adapter'

export const { handlers, signIn, signOut, auth } = NextAuth({
	adapter: BunSQLAdapter(getDb()),
	providers: [
		Resend({
			from: process.env.EMAIL_FROM ?? 'noreply@example.com',
		}),
	],
	session: {
		strategy: 'jwt',
	},
	pages: {
		signIn: '/auth/signin',
		verifyRequest: '/auth/verify',
	},
})
