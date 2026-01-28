import type { SQL } from 'bun'
import type {
	Adapter,
	AdapterAccount,
	AdapterUser,
	VerificationToken,
} from 'next-auth/adapters'

export const BunSQLAdapter = (db: SQL): Adapter => ({
	createUser: async (user) => {
		const [created] = await db`
			INSERT INTO users (email, name, email_verified, image)
			VALUES (${user.email}, ${user.name}, ${user.emailVerified}, ${user.image})
			RETURNING id, email, name, email_verified as "emailVerified", image
		`
		return created as AdapterUser
	},

	getUser: async (id) => {
		const [user] = await db`
			SELECT id, email, name, email_verified as "emailVerified", image
			FROM users WHERE id = ${id}
		`
		return (user as AdapterUser) ?? null
	},

	getUserByEmail: async (email) => {
		const [user] = await db`
			SELECT id, email, name, email_verified as "emailVerified", image
			FROM users WHERE email = ${email}
		`
		return (user as AdapterUser) ?? null
	},

	getUserByAccount: async ({ provider, providerAccountId }) => {
		const [user] = await db`
			SELECT u.id, u.email, u.name, u.email_verified as "emailVerified", u.image
			FROM users u
			JOIN accounts a ON a.user_id = u.id
			WHERE a.provider = ${provider} AND a.provider_account_id = ${providerAccountId}
		`
		return (user as AdapterUser) ?? null
	},

	updateUser: async (user) => {
		const [updated] = await db`
			UPDATE users
			SET name = COALESCE(${user.name ?? null}, name),
				email = COALESCE(${user.email ?? null}, email),
				email_verified = COALESCE(${user.emailVerified ?? null}, email_verified),
				image = COALESCE(${user.image ?? null}, image),
				updated_at = NOW()
			WHERE id = ${user.id}
			RETURNING id, email, name, email_verified as "emailVerified", image
		`
		return updated as AdapterUser
	},

	deleteUser: async (id) => {
		await db`DELETE FROM users WHERE id = ${id}`
	},

	linkAccount: async (account) => {
		await db`
			INSERT INTO accounts (
				user_id, type, provider, provider_account_id,
				refresh_token, access_token, expires_at,
				token_type, scope, id_token, session_state
			) VALUES (
				${account.userId}, ${account.type}, ${account.provider}, ${account.providerAccountId},
				${account.refresh_token ?? null}, ${account.access_token ?? null}, ${account.expires_at ?? null},
				${account.token_type ?? null}, ${account.scope ?? null}, ${account.id_token ?? null}, ${account.session_state ?? null}
			)
		`
		return account as AdapterAccount
	},

	unlinkAccount: async ({ provider, providerAccountId }) => {
		await db`
			DELETE FROM accounts
			WHERE provider = ${provider} AND provider_account_id = ${providerAccountId}
		`
	},

	createVerificationToken: async (token) => {
		await db`
			INSERT INTO verification_tokens (identifier, token, expires)
			VALUES (${token.identifier}, ${token.token}, ${token.expires})
		`
		return token
	},

	useVerificationToken: async ({ identifier, token }) => {
		const [deleted] = await db`
			DELETE FROM verification_tokens
			WHERE identifier = ${identifier} AND token = ${token}
			RETURNING identifier, token, expires
		`
		return (deleted as VerificationToken) ?? null
	},
})
