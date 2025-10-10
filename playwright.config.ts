// import { defineConfig, devices } from '@playwright/test';

// export default defineConfig({
//   testDir: './tests',
//   timeout: 30_000,
//   use: {
//     baseURL: 'http://localhost:3000', // CHANGE if your app runs elsewhere
//     // trace: 'on-first-retry',
//   },
//   webServer: {
//     // CHANGE this to whatever starts your app
//     // Examples:
//     // - Vite:        "npm run dev" (usually http://localhost:5173)
//     // - CRA/Next:    "npm run dev" or "npm run start" (usually http://localhost:3000)
//     command: 'npm run dev',
//     url: 'http://localhost:3000',      // keep in sync with baseURL above
//     reuseExistingServer: !process.env.CI
//   },
//   projects: [
//     { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
//     // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
//     // { name: 'webkit',  use: { ...devices['Desktop Safari'] } },
//   ],
// });

/* eslint-disable notice/notice */

import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({

  testDir: './tests',

  /* Maximum time one test can run for. */
  timeout: 15_000,

  captureGitInfo: { commit: true, diff: true },

  expect: {

    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5_000
  },

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html'], ['list']],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {

    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,

    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',

      /* Project-specific settings. */
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //   },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: {
    //     ...devices['iPhone 12'],
    //   },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: {
    //     channel: 'msedge',
    //   },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: {
    //     channel: 'chrome',
    //   },
    // },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   port: 3000,
  // },
});
