import { test, expect, Page } from '@playwright/test';

const getSearchInput = (page: Page) => page.locator('#searchInput');


test.describe('Wikipedia Main page',  () => {
    
    test.beforeEach(async({ page }) => {
        const wikiHeader = page.locator('a[title="Wikipedia"]');
        await page.goto('/wiki/Main_Page');
        await wikiHeader.waitFor();
        
    })
    
    test('should allow user to search and display results', async ({ page }) => {
        const searchResults = page.locator('[aria-label="Search results"] bdi');
        const searchInput = getSearchInput(page);
        await searchInput.fill('world\'s tallest building');
        await searchResults.first().textContent();

        //Verify search results are relevant to the query
        for (const option of await searchResults.all())
            await expect(option).toContainText(/world's tallest|tallest building/);
    })

    test('should redirect User to the Tallest Buildings page', async ({ page }) => {
        const tallestHeader = page.locator('h1 span[class*="page-title-main"]');
        const searchInput = getSearchInput(page);
        const searchResult = page.locator('[aria-label="Search results"] bdi').first();

        await searchInput.fill('world\'s tallest building');
        await searchResult.click();

        await tallestHeader.waitFor();
        const expectedUrl = "https://en.wikipedia.org/wiki/List_of_tallest_buildings";
        const currentUrl = page.url();
        expect(currentUrl).toEqual(expectedUrl);
    })

})
  