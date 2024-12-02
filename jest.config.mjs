export default {
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  modulePathIgnorePatterns: ['./test'],
};
