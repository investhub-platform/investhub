module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/../tests/frontend"],
  testMatch: ["**/*.test.js"],
  modulePaths: ["<rootDir>/node_modules"],
  moduleDirectories: ["node_modules", "<rootDir>/node_modules"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(gif|ttf|eot|svg|png|jpg|jpeg|webp)$": "<rootDir>/../tests/frontend/__mocks__/fileMock.js",
  },
  clearMocks: true,
};
