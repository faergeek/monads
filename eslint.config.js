import { base, typescript } from '@faergeek/eslint-config';

export default [{ ignores: ['dist/'] }, ...base, ...typescript];
