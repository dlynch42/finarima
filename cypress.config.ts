import { defineConfig } from "cypress";

export default defineConfig({
  projectId: 'o1y9dq',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    // baseUrl: 'https://automodel.vercel.app',
    // baseUrl: 'http://localhost:8080'
    baseUrl: 'http://localhost:3000' // Changed for github actions
  },
});
