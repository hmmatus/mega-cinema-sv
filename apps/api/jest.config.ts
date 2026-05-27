export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': ['ts-jest', { diagnostics: false }],
  },
  collectCoverageFrom: ['**/*.(t|j)s', '!**/*.module.ts', '!**/main.ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    // rootDir resolves to apps/api/src — need 3 levels up to reach repo root
    '^@cinema/shared$': '<rootDir>/../../../packages/shared/src/index.ts',
    '^@cinema/database$': '<rootDir>/../../../packages/database/src/index.ts',
  },
  // pnpm hoists some packages to the workspace root — resolve from there
  modulePaths: ['<rootDir>/../../../node_modules'],
};
