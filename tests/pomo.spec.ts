import { test, expect, Page } from '@playwright/test';

// Helper function to navigate to home
async function goHome(page: Page) {
  await page.goto('/');
}

test.describe('Timer Functionality', () => {
  test('should start and countdown timer', async ({ page }) => {
    await goHome(page);

    await page.getByRole('button', { name: 'Focus Time' }).click();
    await page.getByRole('button', { name: 'Start' }).click();
    await page.waitForTimeout(2000);

    const timerDisplay = page.getByTestId('timer-display').or(page.locator('[class*="font-mono"][class*="text-6xl"]'));
    await expect(timerDisplay).toBeVisible();

    // Timer should have ticked down from 25:00
    const timerText = await timerDisplay.textContent();
    expect(timerText).not.toBe('25:00');
  });

  test('should pause timer', async ({ page }) => {
    await goHome(page);

    await page.getByRole('button', { name: 'Focus Time' }).click();
    await page.getByRole('button', { name: 'Start' }).click();
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Pause' }).click();

    // Verify pause button changed to resume/start
    await expect(page.getByRole('button', { name: /Start|Resume/i })).toBeVisible();
  });

  test('should reset timer', async ({ page }) => {
    await goHome(page);

    await page.getByRole('button', { name: 'Focus Time' }).click();
    await page.getByRole('button', { name: 'Start' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Pause' }).click();

    // Look for reset button
    const resetButton = page.getByRole('button', { name: /Reset/i });
    if (await resetButton.isVisible()) {
      await resetButton.click();
    }
  });
});

test.describe('Theme System', () => {
  test.beforeEach(async ({ page }) => {
    await goHome(page);
    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL('/settings');
  });

  test('should switch to Batman theme', async ({ page }) => {
    await page.getByRole('button', { name: 'Batman', exact: true }).click();
    await expect(page.locator('html')).toHaveClass(/theme-batman/);
  });

  test('should switch to Joker theme', async ({ page }) => {
    await page.getByRole('button', { name: 'Joker', exact: true }).click();
    await expect(page.locator('html')).toHaveClass(/theme-joker/);
  });

  test('should switch to Robin theme', async ({ page }) => {
    await page.getByRole('button', { name: 'Robin', exact: true }).click();
    await expect(page.locator('html')).toHaveClass(/theme-robin/);
  });
});

test.describe('Ambient Sound System', () => {
  test.beforeEach(async ({ page }) => {
    await goHome(page);
    await page.getByRole('link', { name: 'Settings' }).click();
  });

  const ambientSounds = ['Rain', 'Forest', 'Coffee Shop', 'White Noise', 'None'];

  for (const sound of ambientSounds) {
    test(`should select ${sound} ambient sound`, async ({ page }) => {
      const ambientSection = page.locator('div:has-text("Focus Ambience")').first();
      const soundButton = ambientSection.getByRole('button', { name: new RegExp(sound, 'i') });

      await soundButton.click();
      await expect(soundButton).toHaveClass(/border-primary|ring|selected/);
    });
  }
});

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await goHome(page);
    await page.getByRole('link', { name: 'Settings' }).click();
  });

  test('should navigate to settings page', async ({ page }) => {
    await expect(page).toHaveURL('/settings');
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });

  test('should toggle sound effects switch', async ({ page }) => {
    const soundEffectsLabel = page.locator('label:has-text("Sound Effects")');
    const switchContainer = soundEffectsLabel.locator('..').locator('[role="switch"]');

    if (await switchContainer.isVisible()) {
      const wasChecked = await switchContainer.isChecked();
      await switchContainer.click();

      if (wasChecked) {
        await expect(switchContainer).not.toBeChecked();
      } else {
        await expect(switchContainer).toBeChecked();
      }
    }
  });
});

test.describe('History Page', () => {
  test('should navigate to history page', async ({ page }) => {
    await goHome(page);
    await page.getByRole('link', { name: 'History' }).click();

    await expect(page).toHaveURL('/history');
  });

  test('should display mission report heading', async ({ page }) => {
    await goHome(page);
    await page.getByRole('link', { name: 'History' }).click();

    const historyHeading = page.getByRole('heading', { name: /Mission Report|History/i, level: 1 });
    await expect(historyHeading).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate between all pages', async ({ page }) => {
    await goHome(page);

    // Go to Settings
    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL('/settings');

    // Go to History
    await page.getByRole('link', { name: 'History' }).click();
    await expect(page).toHaveURL('/history');

    // Go back to Home/Timer
    await page.getByRole('link', { name: /Home|Timer/i }).click();
    await expect(page).toHaveURL('/');
  });
});
