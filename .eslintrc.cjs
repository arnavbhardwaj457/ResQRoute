module.exports = {
  root: true,
  ignorePatterns: ['node_modules/', '.next/', 'dist/'],
  settings: {
    next: {
      rootDir: ['apps/web'],
    },
  },
  overrides: [
    {
      files: ['apps/web/**/*.{ts,tsx}'],
      extends: ['next/core-web-vitals', 'next/typescript', 'prettier'],
    },
    {
      files: ['apps/api/**/*.ts', 'packages/types/**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      plugins: ['@typescript-eslint'],
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
    },
  ],
};
