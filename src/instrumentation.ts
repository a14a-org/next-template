export const register = async () => {
	// Only run on server, not during build or edge runtime
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		// Validate env first (will throw if invalid)
		await import('./lib/env')

		try {
			const { runMigrations } = await import('./db/migrate')
			await runMigrations()
		} catch (error) {
			console.error('[migrate] Migration failed:', error)
			// Don't crash the app - let it fail naturally if schema is broken
		}
	}
}
