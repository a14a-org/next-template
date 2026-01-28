import { SQL } from 'bun'

let _db: SQL | null = null

export const getDb = () => {
	if (!_db) {
		const url = process.env.DATABASE_URL
		if (!url) {
			throw new Error('DATABASE_URL is required at runtime')
		}
		_db = new SQL(url)
	}
	return _db
}
