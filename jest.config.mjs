import { defaults } from 'jest-config'

// @type {import('jest-config').InitialOptions}
const config = {
  rootDir: './',
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'mts'],
  collectCoverage: false,
  collectCoverageFrom: [
    'packages/**/src/**/*.ts',
    '!**/examples/**',
    '!packages/cli/**',
    '!**/types/**',
    '!**/build/**',
    '!**/node_modules/**',
    '!packages/test-react-app/**',
    '!packages/test-utils/**',
  ],
  coverageReporters: ['json'],
  coverageDirectory: './coverage/jest',
  coverageProvider: 'v8',
  testMatch: [
    '**/(did-comm|data-store|kv-store|url-handler)**/__tests__/**/*.test.ts',
    '<rootDir>/__tests__/**/*.test.ts',
  ],
  automock: false,
  maxWorkers: '30%',
  // // typescript 5 removes the need to specify relative imports as .js, so we should no longer need this workaround
  // // but webpack still requires .js specifiers, so we are keeping it for now
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.m?tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: './packages/tsconfig.settings.json',
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
}

export default config
