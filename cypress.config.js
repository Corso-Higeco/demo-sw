import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/{e2e,smoke}/**/*.cy.js',
    video: true,
  },
  env: {
    API_KEY: 'fake-api-key',
  }
})
