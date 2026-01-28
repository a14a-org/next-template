import { getDb } from './client'
import { migrations } from './migrations'

export const runMigrations = async () => {
	const db = getDb()
	const instanceId = crypto.randomUUID()

	// Ensure migrations table exists
	await db`
		CREATE TABLE IF NOT EXISTS _migrations (
			id TEXT PRIMARY KEY,
			ran_at TIMESTAMP DEFAULT NOW(),
			locked_by TEXT,
			locked_at TIMESTAMP
		)
	`

	// Try to acquire lock (atomic operation)
	// Lock succeeds if: no lock exists, or lock is stale (>5 min old)
	const [lock] = await db`
		INSERT INTO _migrations (id, locked_by, locked_at)
		VALUES ('_lock', ${instanceId}, NOW())
		ON CONFLICT (id) DO UPDATE
		SET locked_by = ${instanceId}, locked_at = NOW()
		WHERE _migrations.locked_by IS NULL
		   OR _migrations.locked_at < NOW() - INTERVAL '5 minutes'
		RETURNING locked_by
	`

	if (lock?.locked_by !== instanceId) {
		console.log('[migrate] Another instance is running migrations, skipping...')
		return
	}

	console.log('[migrate] Lock acquired, running migrations...')

	try {
		// Get already-ran migrations
		const ran = await db`SELECT id FROM _migrations WHERE id != '_lock'`
		const ranIds = new Set(ran.map((r: { id: string }) => r.id))

		// Run pending migrations in order
		for (const migration of migrations) {
			if (ranIds.has(migration.id)) {
				console.log(`[migrate] Skipping ${migration.id} (already ran)`)
				continue
			}

			console.log(`[migrate] Running ${migration.id}...`)
			await migration.up(db)
			await db`INSERT INTO _migrations (id) VALUES (${migration.id})`
			console.log(`[migrate] Completed ${migration.id}`)
		}

		console.log('[migrate] All migrations complete')
	} finally {
		// Release lock
		await db`
			UPDATE _migrations
			SET locked_by = NULL, locked_at = NULL
			WHERE id = '_lock'
		`
		console.log('[migrate] Lock released')
	}
}
