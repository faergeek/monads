import { base, typescript, vitest } from '@faergeek/eslint-config';

export default [
  { ignores: ['dist/'] },
  ...base,
  ...typescript,
  ...vitest.map(config => ({
    ...config,
    files: ['**/*.spec.*'],
  })),
];
