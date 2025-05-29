import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should load the signin page', async ({ page }) => {
    await page.goto('/signin');
    await expect(page).toHaveTitle('Log in');
    await expect(page.locator('text=Google')).toBeVisible();
  });
});
