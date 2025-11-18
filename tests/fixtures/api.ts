import { test as baseTest } from '@playwright/test';

// Extend Playwright's TestOptions to include custom API properties
declare module '@playwright/test' {
  interface TestOptions {
    apiURL: string;
    apiTimeout: number;
    apiHeaders: Record<string, string>;
  }
}

// Define our custom fixtures interface
export interface APIFixtures {
  apiURL: string;
  apiTimeout: number;
  apiHeaders: Record<string, string>;
  apiContext: {
    request: import('@playwright/test').APIRequestContext;
    baseURL: string;
    defaultHeaders: Record<string, string>;
    timeout: number;
  };
}

// Export the extended test with our custom fixtures
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const test = baseTest.extend<APIFixtures>({
  // Basic API configuration fixtures  
  // eslint-disable-next-line no-empty-pattern
  apiURL: async ({}, use, testInfo) => {
    const project = testInfo.project;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectUse = project.use as any; // Type assertion for custom properties
    const url = projectUse.apiURL || process.env.API_URL || 'https://reqres.in/api';
    await use(url);
  },

  // eslint-disable-next-line no-empty-pattern
  apiTimeout: async ({}, use, testInfo) => {
    const project = testInfo.project;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectUse = project.use as any; // Type assertion for custom properties
    const timeout = projectUse.apiTimeout || parseInt(process.env.API_TIMEOUT || '30000');
    await use(timeout);
  },

  // eslint-disable-next-line no-empty-pattern
  apiHeaders: async ({}, use, testInfo) => {
    const project = testInfo.project;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectUse = project.use as any; // Type assertion for custom properties
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(projectUse.apiHeaders || {})
    };
    
    // Add auth token if available
    if (process.env.API_TOKEN) {
      defaultHeaders['Authorization'] = `Bearer ${process.env.API_TOKEN}`;
    }
    
    await use(defaultHeaders);
  },

  // Comprehensive API context fixture
  apiContext: async ({ request, apiURL, apiTimeout, apiHeaders }, use) => {
    const context = {
      request,
      baseURL: apiURL,
      defaultHeaders: apiHeaders,
      timeout: apiTimeout,
    };
    
    await use(context);
  },
});

export { expect } from '@playwright/test';
