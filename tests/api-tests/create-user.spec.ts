import { test, expect } from '../fixtures/api'
import { APIHelpers } from '../helpers/api-helpers'

test.describe('Create User API Tests', () => {
  let createdUserId: string
  let apiHelpers: APIHelpers

  test.beforeEach(async ({ apiContext }) => {
    apiHelpers = new APIHelpers(apiContext)
  })
  
  test.afterEach(async () => {
    // Clean up created user if exists
    if (createdUserId) {
      try {
        await apiHelpers.deleteTestUser(createdUserId)
        console.log('🫥 Deleted test user with ID:', createdUserId)
      } catch (error) {
        console.warn('Failed to delete user:', error)
      }
    }
  })

  test('should register a new user', async () => {
    const userData = {
      name: 'John Doe',
      job: 'Software Engineer'
    }

    const response = await apiHelpers.createTestUser(userData)
    createdUserId = response.user.id

    expect(response.response.status()).toBe(201)
    expect(response.user).toHaveProperty('id')
    expect(response.user.name).toBe(userData.name)
    expect(response.user.job).toBe(userData.job)
  })
})