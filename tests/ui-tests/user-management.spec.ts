import { test, expect } from '@playwright/test';
import { APIHelpers, User } from '../helpers/api-helpers';

test.describe('UI Tests with API Setup/Teardown', () => {
  let apiHelpers: APIHelpers;
  const testUsers: string[] = [];

  test.beforeAll(async ({ request }) => {
    // Initialize API helpers for test data setup
    apiHelpers = new APIHelpers({
      request,
      baseURL: process.env.API_URL || 'https://reqres.in/api',
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });
  });

  test.afterAll(async () => {
    // Clean up all test users created during the test suite
    for (const userId of testUsers) {
      try {
        await apiHelpers.deleteTestUser(userId);
        console.log(`✅ Cleaned up test user: ${userId}`);
      } catch (error) {
        console.warn(`⚠️ Failed to cleanup user ${userId}:`, error);
      }
    }
  });

  test('should display user profile created via API', async ({ page }) => {
    // SETUP: Create test user via API
    const { user } = await apiHelpers.createTestUser({
      name: 'UI Test User',
      email: 'uitest@example.com',
      job: 'UI Tester'
    });
    testUsers.push(user.id);
    console.log(`🔧 Created test user for UI: ${user.name}`);

    // UI TEST: Navigate to a page that would show user data
    // Note: reqres.in is just an API, so we'll simulate UI testing concepts
    await page.goto('https://reqres.in/');
    
    // Verify the page loads correctly
    await expect(page).toHaveTitle(/Reqres/);
    
    // In a real app, you might:
    // 1. Login with the created user
    // 2. Navigate to user profile
    // 3. Verify user data is displayed correctly
    
    console.log(`✅ UI test completed for user: ${user.name}`);
  });

  test('should handle user list populated via API', async ({ page }) => {
    // SETUP: Create multiple test users via API
    const userPromises = Array.from({ length: 2 }, (_, i) =>
      apiHelpers.createTestUser({
        name: `List User ${i + 1}`,
        email: `listuser${i + 1}@example.com`,
        job: 'List Tester'
      })
    );

    const users = await Promise.all(userPromises);
    users.forEach(({ user }) => {
      testUsers.push(user.id);
      console.log(`🔧 Created list user: ${user.name}`);
    });

    // UI TEST: Navigate to user list page
    await page.goto('https://reqres.in/');
    
    // In a real app, you might:
    // 1. Navigate to users list page
    // 2. Verify all created users appear in the list
    // 3. Test list functionality (sorting, filtering, etc.)
    
    await expect(page.locator('h1')).toBeVisible();
    console.log('✅ UI list test completed');
  });

  test('should test user update flow with API verification', async ({ page }) => {
    // SETUP: Create initial user via API
    const { user: initialUser } = await apiHelpers.createTestUser({
      name: 'Update Test User',
      email: 'updatetest@example.com',
      job: 'Update Tester'
    });
    testUsers.push(initialUser.id);

    // UI TEST: Navigate to edit user page
    await page.goto('https://reqres.in/');
    
    // In a real app, you might:
    // 1. Navigate to user edit form
    // 2. Update user information
    // 3. Submit the form
    
    // VERIFICATION: Verify update via API
    const updatedData = {
      name: 'Updated User Name',
      job: 'Updated Job Title'
    };

    const response = await apiHelpers.put(`/users/${initialUser.id}`, {
      data: updatedData
    });

    expect(response.status()).toBe(200);
    const updatedUser = await apiHelpers.expectJSON<User & { updatedAt: string }>(response);
    expect(updatedUser.name).toBe(updatedData.name);
    expect(updatedUser.job).toBe(updatedData.job);
    
    console.log(`✅ User update verified via API: ${updatedUser.name}`);
  });

  test('should test deletion flow with API cleanup', async ({ page }) => {
    // SETUP: Create user to be deleted
    const { user } = await apiHelpers.createTestUser({
      name: 'Delete Test User',
      email: 'deletetest@example.com',
      job: 'Delete Tester'
    });
    // Don't add to testUsers array since we'll delete it in the test

    // UI TEST: Navigate and perform deletion
    await page.goto('https://reqres.in/');
    
    // In a real app, you might:
    // 1. Navigate to user profile
    // 2. Click delete button
    // 3. Confirm deletion
    
    // API VERIFICATION: Verify deletion
    const deleteResponse = await apiHelpers.deleteTestUser(user.id);
    expect(deleteResponse.status()).toBe(204);
    
    console.log(`✅ User deletion completed: ${user.name}`);
  });
});