export default {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",

  // which test to run

  testMatch: ["<rootDir>/controllers/*.test.js", "<rootDir>/middlewares/*.test.js", "<rootDir>/helpers/*.test.js", "<rootDir>/routes/*.test.js", "<rootDir>/models/*.test.js", "<rootDir>/config/*.test.js"],


  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "controllers/**", 
    "middlewares/**", 
    "helpers/**", 
    "routes/authRoute.js", 
    "models/**",
    "config/**"],
  coverageThreshold: {
    global: {
      lines: 89,
      functions: 94,
    },
  },
};
