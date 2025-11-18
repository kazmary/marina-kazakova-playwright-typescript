import { test, expect } from '@playwright/test';

test('should redirect from en.wikipedia.org to https://en.wikipedia.org/wiki/Main_Page', async ({ page }) => {
  await page.goto('/');

  const expectedUrl = 'https://en.wikipedia.org/wiki/Main_Page';
  const currentUrl = page.url();
  expect(expectedUrl).toEqual(currentUrl);
});
  