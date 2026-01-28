import type { SQL } from 'bun'

export const id = '001-initial'

export const up = async (db: SQL) => {
	// Users table (NextAuth)
	await db`
		CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			email TEXT UNIQUE NOT NULL,
			name TEXT,
			email_verified TIMESTAMP,
			image TEXT,
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW()
		)
	`

	// Accounts table (NextAuth - for OAuth providers)
	await db`
		CREATE TABLE IF NOT EXISTS accounts (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			type TEXT NOT NULL,
			provider TEXT NOT NULL,
			provider_account_id TEXT NOT NULL,
			refresh_token TEXT,
			access_token TEXT,
			expires_at INTEGER,
			token_type TEXT,
			scope TEXT,
			id_token TEXT,
			session_state TEXT,
			UNIQUE(provider, provider_account_id)
		)
	`

	// Verification tokens (NextAuth - for magic links)
	await db`
		CREATE TABLE IF NOT EXISTS verification_tokens (
			identifier TEXT NOT NULL,
			token TEXT UNIQUE NOT NULL,
			expires TIMESTAMP NOT NULL,
			PRIMARY KEY(identifier, token)
		)
	`
}
