export default {
  // name displayed during tests
  displayName: "frontend",

  // simulates browser environment in jest
  // e.g., using document.querySelector in your tests
  testEnvironment: "jest-environment-jsdom",

  // jest does not recognise jsx files by default, so we use babel to transform any jsx files
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },

  // tells jest how to handle css/scss imports in your tests
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
  },

  // ignore all node_modules except styleMock (needed for css imports)
  transformIgnorePatterns: ["/node_modules/(?!(styleMock\\.js)$)"],

  // only run these tests
  testMatch: [
    "<rootDir>/client/src/pages/**/*.test.js",
    "<rootDir>/client/src/context/**/*.test.js",
    "<rootDir>/client/src/components/**/*.test.js",
    "<rootDir>/client/src/components/*.test.js",
    "<rootDir>/client/src/pages/admin/*.test.js",
    "<rootDir>/client/src/pages/user/*.test.js",
    "<rootDir>/client/src/pages/*.test.js",
    "<rootDir>/client/src/hooks/**/*.test.js",
    "<rootDir>/client/src/pages/admin/Products_Integration_UI_test/*.test.js",
  ],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "client/src/pages/Auth/**",
    "client/src/pages/Search.js",
    "client/src/pages/Categories.js",
    "client/src/context/**",
    "client/src/hooks/**",
    "client/src/components/Form/**",
    "client/src/components/Routes/Private.js",
    "client/src/components/UserMenu.js",
    "client/src/components/Footer.js",
    "client/src/components/Header.js",
    "client/src/components/Layout.js",
    "client/src/components/Spinner.js",
    "client/src/pages/Policy.js",
    "client/src/pages/Contact.js",
    "client/src/pages/About.js",
    "client/src/pages/Pagenotfound.js",
    "client/src/pages/HomePage.js",
    "client/src/pages/user/Dashboard.js",
    "client/src/pages/user/Orders.js",
    "client/src/pages/user/Profile.js",
    "client/src/pages/admin/**",
    "client/src/context/cart.js",
    "client/src/components/AdminMenu.js",
    "client/src/pages/CartPage.js",
  ],

  coverageThreshold: {
    global: {
      lines: 98,
      functions: 98,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/client/src/setupTests.js"],
};
