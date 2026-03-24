module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/../tests/backend"],
  testMatch: ["**/*.test.js"],
  modulePaths: ["<rootDir>/node_modules"],
  moduleDirectories: ["node_modules", "<rootDir>/node_modules"],
  transform: {},
  clearMocks: true,
  collectCoverageFrom: [
    "src/services/**/*.js",
    "src/utils/**/*.js",
    "src/controllers/**/*.js",
    "!src/services/emailService.js",
  ],
};
