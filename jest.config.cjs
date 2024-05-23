module.exports = {
  preset: 'ts-jest',

  // testEnvironment: 'jest-environment-jsdom',
  testEnvironment: 'jsdom',
  setupFiles: ['jest-canvas-mock'],

  transformIgnorePatterns: ["/node_modules/(?!three/examples/)"],
  transform: {
    "node_modules/three/examples/.+.(j|t)sx?$": "ts-jest",
  },
};
