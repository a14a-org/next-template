import { defineConfig, devices } from '@playwright/test'

const PORT = 3000
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
	use: {
		baseURL,
		trace: 'on-first-retry',
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],
	webServer: {
		command: 'bun run start',
		url: baseURL,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
		// Dummy values so the production server boots in CI without real
		// secrets. The DB connection is lazy and the homepage issues no
		// queries, so a placeholder DATABASE_URL is never dialed. These are
		// NOT real credentials.
		env: {
			DATABASE_URL:
				process.env.DATABASE_URL ?? 'postgres://user:pass@localhost:5432/db',
			AUTH_SECRET:
				process.env.AUTH_SECRET ?? 'smoke-test-secret-value-not-for-production',
		},
	},
})
