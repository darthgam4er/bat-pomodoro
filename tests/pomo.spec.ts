import { test, expect } from '@playwright/test';

test('Bat Pomodoro App', async ({ page }) => {
  await page.goto('/');

  // Test Timer Functionality
  await page.getByRole('button', { name: 'Focus Time' }).click();
  await page.getByRole('button', { name: 'Start' }).click();
  await page.waitForTimeout(2000); // wait for 2 seconds for the timer to tick down

  const timerDisplay = page.locator('span.font-mono.text-6xl');
  await expect(timerDisplay).not.toHaveText('25:00'); // Check it has ticked down
  await expect(timerDisplay).toHaveText(/24:5[89]/); // More specific check

  await page.getByRole('button', { name: 'Pause' }).click();

  // Test Navigation to Settings
  await page.getByRole('link', { name: 'Settings' }).click();
  await expect(page).toHaveURL('/settings');
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

  // Test Theme System with assertions
  await page.getByRole('button', { name: 'Batman', exact: true }).click();
  await expect(page.locator('html')).toHaveClass(/theme-batman/);

  await page.getByRole('button', { name: 'Joker', exact: true }).click();
  await expect(page.locator('html')).toHaveClass(/theme-joker/);

  await page.getByRole('button', { name: 'Robin', exact: true }).click();
  await expect(page.locator('html')).toHaveClass(/theme-robin/);

  // Test Ambient Sound System with assertions
  const ambientSoundsSection = page.locator('div.rounded-xl:has-text("Focus Ambience")');

  const rainButton = ambientSoundsSection.getByRole('button', { name: /Rain/ });
  await rainButton.click();
  await expect(rainButton).toHaveClass(/border-primary/);

  const forestButton = ambientSoundsSection.getByRole('button', { name: /Forest/ });
  await forestButton.click();
  await expect(forestButton).toHaveClass(/border-primary/);

  const coffeeButton = ambientSoundsSection.getByRole('button', { name: /Coffee Shop/ });
  await coffeeButton.click();
  await expect(coffeeButton).toHaveClass(/border-primary/);

  const whiteNoiseButton = ambientSoundsSection.getByRole('button', { name: /White Noise/ });
  await whiteNoiseButton.click();
  await expect(whiteNoiseButton).toHaveClass(/border-primary/);

  const noneButton = ambientSoundsSection.getByRole('button', { name: /None/ });
  await noneButton.click();
  await expect(noneButton).toHaveClass(/border-primary/);


  // Test Settings Page toggle switches
  const soundEffectsSwitchContainer = page.locator('div:has(> div > label:has-text("Sound Effects"))');
  const soundEffectsSwitch = soundEffectsSwitchContainer.locator('[role="switch"]');

  await soundEffectsSwitch.click(); // Turn it off
  await expect(soundEffectsSwitch).not.toBeChecked();
  await soundEffectsSwitch.click(); // Turn it on
  await expect(soundEffectsSwitch).toBeChecked();

  // Test History Tracking
  await page.getByRole('link', { name: 'History' }).click();
  await expect(page).toHaveURL('/history');
  const historyHeading = page.getByRole('heading', { name: 'Mission Report', level: 1 });
  await expect(historyHeading).toBeVisible();
});
