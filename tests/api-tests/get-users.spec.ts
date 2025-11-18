import { test, expect, request } from '@playwright/test'

test.describe('GET - /users', () => {
  const baseURL = 'https://reqres.in/api'

  test('GET /users returns a list of users', async () => {
    // Create an API request context
    const apiContext = await request.newContext()

    const response = await apiContext.get(`${baseURL}/users?page=2`)
    console.log(response)

    expect(response.status()).toBe(200)

    const body = await response.json()

    expect(body).toHaveProperty('data')
    expect(Array.isArray(body.data)).toBeTruthy()
    expect(body.data.length).toBeGreaterThan(0)
    expect(body.data[0]).toHaveProperty('email')
    expect(body.data[0]).toHaveProperty('first_name')

    console.log('✅ Users retrieved:', body.data.length)
  })
})
