import { base, typescript, vitest } from '@faergeek/eslint-config';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist/']),
  base,
  typescript,
  { files: ['**/*.spec.*'], extends: [vitest] },
]);
