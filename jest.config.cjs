module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(wagmi|viem|@tanstack/react-query)/)',
  ],
  moduleDirectories: ['node_modules', '<rootDir>'],
  modulePathIgnorePatterns: ['./test'],
};
