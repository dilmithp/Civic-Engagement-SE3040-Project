export default {
  testEnvironment: 'node',
  transform: {
    '^.+\.js$': 'babel-jest'
  },
  testMatch: ['**/tests/**/*.test.js'],
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/config/**'
  ]
};
