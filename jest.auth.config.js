export default {
  // display name
  displayName: "auth",

  // when testing backend
  testEnvironment: "node",

  // which test to run
  testMatch: ["<rootDir>/middlewares/*.test.js", "<rootDir>/routes/*.test.js"],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: ["middlewares/**", "routes/**"],
  coverageThreshold: {
    global: {
      lines: 100,
      functions: 100,
    },
  },
};
