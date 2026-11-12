import { expect, type Page } from '@playwright/test'

export async function boot(page: Page): Promise<string[]> {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  await page.addInitScript(() => localStorage.clear())
  await page.goto('./')
  await page.getByTestId('start').click()
  await page.locator('[data-testid="profile"][data-name="Kind 1"]').click()
  await expect(page.getByTestId('home')).toBeVisible()
  return errors
}

/** Tap the inner disk to set the hour, then the rim to set the minute. */
export async function setAnalog(page: Page, hour: number, minute: number): Promise<void> {
  const clock = page.getByTestId('clock')
  const box = await clock.boundingBox()
  if (!box) throw new Error('Uhr nicht sichtbar')
  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2
  const reach = Math.min(box.width, box.height) / 2
  const at = (degrees: number, radius: number) => {
    const rad = (degrees * Math.PI) / 180
    return { x: cx + Math.sin(rad) * radius, y: cy - Math.cos(rad) * radius }
  }
  const hourPoint = at((hour % 12) * 30, reach * 0.42)
  const minutePoint = at(minute * 6, reach * 0.86)
  await page.mouse.click(hourPoint.x, hourPoint.y)
  await page.mouse.click(minutePoint.x, minutePoint.y)
  await expect(clock).toHaveAttribute('data-minute', String(minute))
  const shown = Number(await clock.getAttribute('data-hour'))
  const face = shown % 12 === 0 ? 12 : shown % 12
  const want = hour % 12 === 0 ? 12 : hour % 12
  expect(face, `Stundenzeiger zeigt ${shown}`).toBe(want)
}

export async function setDigital(page: Page, hour: number, minute: number): Promise<void> {
  const digital = page.getByTestId('digital')
  for (let i = 0; i < 24; i++) {
    if (Number(await digital.getAttribute('data-hour')) === hour) break
    await page.getByTestId('hour-up').click()
  }
  const minuteUp = page.getByTestId('minute-up')
  for (let i = 0; i < 70; i++) {
    if (Number(await digital.getAttribute('data-minute')) === minute) break
    if ((await minuteUp.count()) === 0) break
    await minuteUp.click()
  }
  await expect(digital).toHaveAttribute('data-hour', String(hour))
  await expect(digital).toHaveAttribute('data-minute', String(minute))
}

export async function solveTask(page: Page, mode: string): Promise<void> {
  const task = page.getByTestId('task')
  await expect(task).toBeVisible()
  const hour = Number(await task.getAttribute('data-target-hour'))
  const minute = Number(await task.getAttribute('data-target-minute'))
  if (mode === 'hear' || mode === 'd2a') {
    await setAnalog(page, hour, minute)
  } else if (mode === 'a2d') {
    await setDigital(page, hour, minute)
  } else {
    await page.locator(`[data-testid="option"][data-hour="${hour}"][data-minute="${minute}"]`).click()
  }
  await page.getByTestId('check').click()
  await page.getByTestId('next').click()
}
