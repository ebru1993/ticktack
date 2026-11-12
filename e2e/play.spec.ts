import { expect, test } from '@playwright/test'
import { boot, setAnalog, solveTask } from './helpers.ts'

const MODES = ['hear', 'read', 'd2a', 'a2d'] as const

test('eine Runde in jedem Modus, iPad WebKit', async ({ page }) => {
  const errors = await boot(page)

  for (const mode of MODES) {
    await page.getByTestId(`mode-${mode}`).click()
    await expect(page.getByTestId('task')).toHaveAttribute('data-mode', mode)
    for (let task = 0; task < 5; task++) {
      await solveTask(page, mode)
    }
    await expect(page.getByTestId('round-end')).toBeVisible()
    await expect(page.getByTestId('round-end')).toContainText('Neuer Sticker')
    await page.getByTestId('done').click()
    await expect(page.getByTestId('home')).toBeVisible()
  }

  await page.getByTestId('mode-free').click()
  await expect(page.getByTestId('free-play')).toBeVisible()
  await setAnalog(page, 4, 0)
  await expect(page.getByTestId('digital')).toHaveAttribute('data-hour', '4')
  await expect(page.getByTestId('digital')).toHaveAttribute('data-minute', '0')
  await page.getByTestId('speaker').click()
  await page.getByTestId('back').click()
  await expect(page.getByTestId('home')).toBeVisible()

  // Headless WebKit has no audio output. A real iPad plays the generated tones.
  const serious = errors.filter((message) => !/audio device|favicon|manifest/i.test(message))
  expect(serious).toEqual([])
})

test('funktioniert offline nach dem ersten Laden', async ({ page, context }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('./')
  await page.getByTestId('start').waitFor()
  await page.waitForFunction(async () => {
    const ready = await navigator.serviceWorker?.ready
    return Boolean(ready?.active && navigator.serviceWorker.controller)
  })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.getByTestId('start').waitFor()
  await context.setOffline(true)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('start')).toBeVisible()
  await page.getByTestId('start').click()
  await expect(page.locator('[data-testid="profile"][data-name="Kind 1"]')).toBeVisible()
  const serious = errors.filter((message) => !/audio device/i.test(message))
  expect(serious).toEqual([])
})
