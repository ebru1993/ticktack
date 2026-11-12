import { expect, test, devices, type Page } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { boot, setAnalog, solveTask } from './helpers.ts'

const OUT = '/workspace/ticktack-shots'

async function shot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false })
}

test('Bildschirme im iPad-Querformat', async ({ page }) => {
  await mkdir(OUT, { recursive: true })
  await page.addInitScript(() => localStorage.clear())
  await page.goto('./')
  await page.getByTestId('start').waitFor()
  await shot(page, '01-willkommen')

  await page.getByTestId('start').click()
  await page.locator('[data-testid="profile"][data-name="Kind 1"]').waitFor()
  await shot(page, '02-profile')
  await page.locator('[data-testid="profile"][data-name="Kind 1"]').click()
  await shot(page, '03-home')

  for (const [mode, name] of [
    ['read', '08-lesen'],
    ['d2a', '09-digital-zu-analog'],
    ['a2d', '10-analog-zu-digital'],
  ] as const) {
    await page.getByTestId(`mode-${mode}`).click()
    await expect(page.getByTestId('task')).toHaveAttribute('data-mode', mode)
    await shot(page, name)
    await page.getByTestId('back').click()
  }

  await page.getByTestId('mode-free').click()
  await setAnalog(page, 3, 30)
  await shot(page, '11-frei')
  await page.getByTestId('back').click()

  await page.getByTestId('mode-hear').click()
  await expect(page.getByTestId('task')).toBeVisible()
  await shot(page, '04-hoeren')

  const task = page.getByTestId('task')
  const hour = Number(await task.getAttribute('data-target-hour'))
  const minute = Number(await task.getAttribute('data-target-minute'))
  const wrongHour = hour === 6 ? 9 : 6
  await setAnalog(page, wrongHour, minute === 0 ? 20 : 0)
  await page.getByTestId('check').click()
  await expect(page.getByTestId('task')).toHaveAttribute('data-phase', 'wrong')
  await page.waitForTimeout(700)
  await shot(page, '05-hinweis')

  await setAnalog(page, hour, minute)
  await page.getByTestId('check').click()
  await expect(page.getByTestId('next')).toBeVisible()
  await shot(page, '06-super')
  await page.getByTestId('next').click()
  for (let i = 0; i < 4; i++) await solveTask(page, 'hear')
  await expect(page.getByTestId('round-end')).toBeVisible()
  await page.waitForTimeout(700)
  await shot(page, '07-runde')
  await page.getByTestId('done').click()

  await page.getByTestId('album').click()
  await shot(page, '12-album')
  await page.getByTestId('back').click()

  await page.getByTestId('parent').click()
  await shot(page, '13-eltern-halten')
  const hold = page.getByTestId('parent-hold')
  const box = await hold.boundingBox()
  if (!box) throw new Error('Halte-Knopf fehlt')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(3200)
  await page.mouse.up()
  await expect(page.getByTestId('parent-math')).toBeVisible()
  await shot(page, '14-eltern-rechnen')
  const question = await page.locator('.math-q').innerText()
  const match = question.match(/(\d+)\s*([+-])\s*(\d+)/)
  if (!match) throw new Error(question)
  const left = Number(match[1])
  const right = Number(match[3])
  const answer = match[2] === '+' ? left + right : left - right
  await page.getByTestId(`key-${answer}`).click()
  await expect(page.getByTestId('parent-panel')).toBeVisible()
  await shot(page, '15-eltern')
})

test('Bildschirme im iPad-Hochformat', async ({ browser }) => {
  await mkdir(OUT, { recursive: true })
  const context = await browser.newContext({
    ...devices['iPad (gen 7)'],
    hasTouch: true,
    locale: 'de-CH',
  })
  const page = await context.newPage()
  await boot(page)
  await shot(page, '16-home-hochformat')
  await page.getByTestId('mode-hear').click()
  await expect(page.getByTestId('task')).toBeVisible()
  await shot(page, '17-hoeren-hochformat')
  await context.close()
})
