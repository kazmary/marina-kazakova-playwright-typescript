import { APIRequestContext, APIResponse } from '@playwright/test'

// Type definitions for API responses based on reqres.in API structure
export interface User {
  id?: number | string
  email: string
  first_name?: string
  last_name?: string
  avatar?: string
  // Additional fields for user creation/updates
  name?: string
  job?: string
  createdAt?: string
  updatedAt?: string
}

export interface UsersResponse {
  page: number
  per_page: number
  total: number
  total_pages: number
  data: User[]
}

export interface CreateUserResponse {
  id: string;
  name: string;
  job: string;
  createdAt: string;
}

export type RequestData = Record<string, unknown> | string | number | boolean | null;

/**
 * API Helper utilities for common operations
 */
export class APIHelpers {
  private request: APIRequestContext
  private baseURL: string
  private defaultHeaders: Record<string, string>
  private timeout: number

  constructor(context: {
    request: APIRequestContext;
    baseURL: string;
    defaultHeaders: Record<string, string>;
    timeout: number;
  }) {
    this.request = context.request
    this.baseURL = context.baseURL
    this.defaultHeaders = context.defaultHeaders
    this.timeout = context.timeout
  }

  /**
   * Generic GET request with error handling
   */
  async get(endpoint: string, options: {
    headers?: Record<string, string>;
    params?: Record<string, string>;
  } = {}): Promise<APIResponse> {
    const url = this.buildURL(endpoint, options.params)
    const headers = { ...this.defaultHeaders, ...options.headers }

    const response = await this.request.get(url, {
      headers,
      timeout: this.timeout,
    })

    return response
  }

  /**
   * Generic POST request with error handling
   */
  async post(endpoint: string, options: {
    data?: RequestData;
    headers?: Record<string, string>;
    params?: Record<string, string>;
  } = {}): Promise<APIResponse> {
    const url = this.buildURL(endpoint, options.params)
    const headers = { ...this.defaultHeaders, ...options.headers }

    const response = await this.request.post(url, {
      data: options.data,
      headers,
      timeout: this.timeout,
    })

    return response
  }

  /**
   * Generic PUT request with error handling
   */
  async put(endpoint: string, options: {
    data?: RequestData;
    headers?: Record<string, string>;
    params?: Record<string, string>;
  } = {}): Promise<APIResponse> {
    const url = this.buildURL(endpoint, options.params)
    const headers = { ...this.defaultHeaders, ...options.headers }

    const response = await this.request.put(url, {
      data: options.data,
      headers,
      timeout: this.timeout,
    })

    return response
  }

  /**
   * Generic PATCH request with error handling
   */
  async patch(endpoint: string, options: {
    data?: RequestData;
    headers?: Record<string, string>;
    params?: Record<string, string>;
  } = {}): Promise<APIResponse> {
    const url = this.buildURL(endpoint, options.params)
    const headers = { ...this.defaultHeaders, ...options.headers }

    const response = await this.request.patch(url, {
      data: options.data,
      headers,
      timeout: this.timeout,
    })

    return response
  }

  /**
   * Generic DELETE request with error handling
   */
  async delete(endpoint: string, options: {
    headers?: Record<string, string>;
    params?: Record<string, string>;
  } = {}): Promise<APIResponse> {
    const url = this.buildURL(endpoint, options.params)
    const headers = { ...this.defaultHeaders, ...options.headers }

    const response = await this.request.delete(url, {
      headers,
      timeout: this.timeout,
    })

    return response
  }

  /**
   * Build full URL with query parameters
   */
  private buildURL(endpoint: string, params?: Record<string, string>): string {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`
    
    if (!params || Object.keys(params).length === 0) {
      return url
    }

    const searchParams = new URLSearchParams(params)
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}${searchParams.toString()}`
  }

  /**
   * Parse JSON response safely
   */
  async parseJSON<T = unknown>(response: APIResponse): Promise<T> {
    try {
      return await response.json()
    } catch (error) {
      throw new Error(`Failed to parse JSON response: ${error}`)
    }
  }

  /**
   * Assert response status and return JSON
   */
  async expectJSON<T = unknown>(response: APIResponse, expectedStatus: number = 200): Promise<T> {
    if (response.status() !== expectedStatus) {
      const text = await response.text()
      throw new Error(`Expected status ${expectedStatus}, got ${response.status()}. Response: ${text}`)
    }
    return this.parseJSON<T>(response)
  }

  /**
   * Create test data helper - useful for test setup
   * Uses reqres.in POST /users endpoint which accepts name and job
   */
  async createTestUser(userData: Partial<User> = {}): Promise<{ response: APIResponse; user: CreateUserResponse }> {
    const defaultUser = {
      name: `Test User ${Date.now()}`,
      job: 'QA Engineer',
      ...userData
    }

    const response = await this.post('/users', { data: defaultUser })
    const user = await this.expectJSON<CreateUserResponse>(response, 201)
    
    return { response, user }
  }

  /**
   * Register a new user - uses reqres.in POST /register endpoint
   * Requires email and password, returns id and token
   */
  async registerUser(credentials: { email: string; password: string }): Promise<{ response: APIResponse; user: { id: number; token: string } }> {
    const response = await this.post('/register', { data: credentials })
    const user = await this.expectJSON<{ id: number; token: string }>(response, 200)
    
    return { response, user }
  }

  /**
   * Clean up test data helper - useful for test teardown
   */
  async deleteTestUser(userId: string): Promise<APIResponse> {
    return this.delete(`/users/${userId}`)
  }

  /**
   * Get users with pagination support
   */
  async getUsers(page: number = 1, perPage: number = 6): Promise<{ response: APIResponse; data: UsersResponse }> {
    const response = await this.get('/users', {
      params: { page: page.toString(), per_page: perPage.toString() }
    })
    const data = await this.expectJSON<UsersResponse>(response)
    
    return { response, data }
  }

  /**
   * Authentication helper (if your API supports it)
   */
  async authenticate(credentials: { username?: string; password?: string; token?: string }): Promise<string> {
    if (credentials.token) {
      return credentials.token
    }

    // Example authentication flow - adjust based on your API
    const response = await this.post('/auth/login', {
      data: {
        username: credentials.username,
        password: credentials.password
      }
    })

    const authData = await this.expectJSON<{ token?: string; access_token?: string }>(response)
    return authData.token || authData.access_token || ''
  }

  /**
   * Wait for condition with polling
   */
  async waitForCondition(
    checkFn: () => Promise<boolean>,
    options: { timeout?: number; interval?: number } = {}
  ): Promise<void> {
    const { timeout = 30000, interval = 1000 } = options
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      if (await checkFn()) {
        return
      }
      await new Promise(resolve => setTimeout(resolve, interval))
    }

    throw new Error(`Condition not met within ${timeout}ms`)
  }
}