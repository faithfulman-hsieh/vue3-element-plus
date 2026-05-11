import { test, expect } from '@playwright/test';

test('homepage shows body', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
});
