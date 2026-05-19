export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s', '!**/*.module.ts', '!**/main.ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    // rootDir resolves to apps/api/src — need 3 levels up to reach repo root
    '^@cinema/shared$': '<rootDir>/../../../packages/shared/src/index.ts',
    '^@cinema/database$': '<rootDir>/../../../packages/database/src/index.ts',
  },
};
