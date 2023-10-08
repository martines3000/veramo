// vite.config.ts
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    watch: false,
    pool: 'forks',
    globals: true,
    include: ['**/__tests__/**/*.test.ts'],
    exclude: [
      '**/node_modules',
      'packages/did-comm',
      '__tests__',
      'packages/kv-store',
      'packages/data-store',
      'packages/url-handler',
    ],
    silent: true,
    cache: false,
    environment: 'node',
    server: {
      deps: {
        fallbackCJS: false,
      },
    },
    testTimeout: 15000,
    poolOptions: {
      forks: {
        minForks: 1,
        maxForks: 8,
      },
    },
    logHeapUsage: true,
    coverage: {
      enabled: true,
      provider: 'v8',
      clean: true,
      reporter: ['json'],
      include: [
        'packages/**/src/**/*.ts',
        '!**/examples/**',
        '!packages/cli/**',
        '!**/types/**',
        '!**/build/**',
        '!**/node_modules/**',
        '!packages/test-react-app/**',
        '!packages/test-utils/**',
      ],
    },
  },
})
