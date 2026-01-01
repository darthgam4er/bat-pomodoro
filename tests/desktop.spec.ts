import { test, expect } from '@playwright/test';

test.describe('Tauri Desktop Integration', () => {
  test('should render desktop-specific buttons without errors', async ({ page }) => {
    await page.goto('/');

    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore expected errors when Tauri API is not available in the browser
        if (!text.includes('Failed to toggle mini mode') &&
            !text.includes('Failed to load data') &&
            !text.includes('Failed to save data') &&
            !text.includes('Failed to minimize')) {
            consoleErrors.push(text);
        }
      }
    });

    // Check for Mini Mode button
    const miniModeButton = page.getByTitle('Mini Mode');
    await expect(miniModeButton).toBeVisible();
    await miniModeButton.click();

    // Check for Minimize button
    const minimizeButton = page.getByTitle('Minimize');
    await expect(minimizeButton).toBeVisible();
    await minimizeButton.click();

    // Assert that no unexpected console errors were thrown
    expect(consoleErrors).toHaveLength(0);
  });
});
