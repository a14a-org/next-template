import { expect, test } from '@playwright/test'

// Content-agnostic smoke test: the homepage must respond 200, render a visible
// document body, and produce no uncaught page errors. This guards against the
// app silently failing to build or boot (e.g. a runtime-only module breaking
// the production server) without coupling to specific copy that may change.
test('homepage renders without errors', async ({ page }) => {
	const pageErrors: string[] = []
	page.on('pageerror', (err) => pageErrors.push(err.message))

	const response = await page.goto('/')
	expect(response, 'navigation should return a response').not.toBeNull()
	expect(response?.status(), 'homepage should respond 200').toBe(200)

	await expect(page.locator('body')).toBeVisible()
	expect(pageErrors, 'no uncaught page errors').toEqual([])
})
