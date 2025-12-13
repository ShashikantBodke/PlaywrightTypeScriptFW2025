import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  //retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list'],
    ['allure-playwright'],
    ['playwright-html-reporter',
      {
        testFolder: 'tests',
        title: 'Opencart HTML Report',
        project: 'Opencart',
        release: '9.87.6',
        testEnvironment: 'PROD',
        embedAssets: true,
        embedAttachments: true,
        outputFolder: 'playwright-html-report',
        minifyAssets: true,
        startServer: false,
      }],
  ],
  use: {
    trace: 'on-first-retry',
    headless: true,
    screenshot: 'on-first-failure',
    video: 'on',
    baseURL: 'https://naveenautomationlabs.com/opencart/index.php',
    httpCredentials:{
      username:'admin',
      password:'admin'
    }
  },
  metadata: {
    appUsername: 'auto_cm1lnwi@nal.com',
    appPassword: 'Test@123'
  },
  /* Configure projects for major browsers */
  projects: [
    // {
    //   name: 'Microsoft Edge',
    //   use: {
    //     channel: 'msedge',
    //     viewport: null,
    //     launchOptions: {
    //       args: ['--start-maximized'],
    //       ignoreDefaultArgs: ['--window-size=1280,720']
    //     }
    //   }
    // },
    {
      name: 'Google Chrome',
      use: {
        channel: 'chrome',
        viewport: null,
        launchOptions: {
          args: ['--start-maximized'],
          ignoreDefaultArgs: ['--window-size=1280,720']
        }
      }
    },
    // {
    //   name: 'Chromium',
    //   use: {
    //     browserName: 'chromium',
    //     viewport: { width: 1920, height: 1080 },
    //     launchOptions: {
    //       args: [],
    //       ignoreDefaultArgs: ['--window-size=1280,720']
    //     }
    //   }
    // },
    // {
    //   name: 'Firefox',
    //   use: {
    //     browserName: 'firefox',
    //     viewport: { width: 1920, height: 1080 },
    //     launchOptions: {
    //       args: [],
    //       ignoreDefaultArgs: ['--window-size=1280,720']
    //     }
    //   }
    // },
    // {
    //   name: 'WebKit',
    //   use: {
    //     browserName: 'webkit',
    //     viewport: { width: 1920, height: 1080 },
    //     launchOptions: {
    //       args: [],
    //       ignoreDefaultArgs: ['--window-size=1280,720']
    //     }
    //  }
   // },
   ]


});
