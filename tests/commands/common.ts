import { test as base } from '@playwright/test';

const test = base.extend({
  wikipediaActions: async ({ page }, use) => {
    const actions = {
      search: async (query: string) => {
        await page.locator('#searchInput').fill(query);
        await page.locator('[aria-label="Search results"] bdi').first().waitFor();
      },
      clickFirstResult: async () => {
        await page.locator('[aria-label="Search results"] bdi').first().click();
      }
    };
    await use(actions);
  }
});

export { test };