import type { SQL } from 'bun'

let _db: SQL | null = null

const connect = (): SQL => {
	const url = process.env.DATABASE_URL
	if (!url) {
		throw new Error('DATABASE_URL is required at runtime')
	}
	// Load Bun's built-in SQL lazily so the module graph can be evaluated
	// under Node during `next build` (page-data collection) without requiring
	// the `bun` module, which only exists at runtime under Bun.
	const { SQL: BunSQL } = require('bun') as typeof import('bun')
	return new BunSQL(url)
}

const resolve = (): SQL => {
	if (!_db) {
		_db = connect()
	}
	return _db
}

// A lazy proxy so `getDb()` can be called at module-eval time (e.g. when the
// auth route is loaded by a Node worker during `next build`) without opening a
// connection or touching the runtime-only `bun` SQL module. The real `SQL`
// instance is created on first actual use (tagged-template call or property
// access), which only happens at runtime under Bun.
const lazyDb = new Proxy((() => {}) as unknown as SQL, {
	apply: (_target, _thisArg, args) =>
		(resolve() as unknown as (...a: unknown[]) => unknown)(...args),
	get: (_target, prop, receiver) => Reflect.get(resolve(), prop, receiver),
	has: (_target, prop) => Reflect.has(resolve(), prop),
}) as SQL

export const getDb = (): SQL => lazyDb
