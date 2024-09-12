import type { BenchOptions } from 'vitest';
import { bench, describe } from 'vitest';

import { Reader } from './reader.js';

const BENCH_OPTIONS: BenchOptions = {};

interface Env {
  getNumber: () => number;
  getString: () => string;
}

describe('dependency injection', () => {
  bench(
    'argument',
    () => {
      function run(env: Env) {
        let n = 0;
        for (let i = 0; i < 100; i++) n += env.getNumber();

        return `${env.getString()}: ${n}`;
      }

      run({
        getNumber: () => 42,
        getString: () => 'foo',
      });
    },
    BENCH_OPTIONS,
  );

  bench(
    'reader with map',
    () => {
      Reader.ask<Env>()
        .map(env => {
          let n = 0;
          for (let i = 0; i < 100; i++) n += env.getNumber();

          return `${env.getString()}: ${n}`;
        })
        .run({
          getNumber: () => 42,
          getString: () => 'foo',
        });
    },
    BENCH_OPTIONS,
  );

  bench(
    'reader with generators',
    () => {
      Reader.do(function* f() {
        const env = yield* Reader.ask<Env>();

        let n = 0;
        for (let i = 0; i < 100; i++) n += env.getNumber();

        return `${env.getString()}: ${n}`;
      }).run({
        getNumber: () => 42,
        getString: () => 'foo',
      });
    },
    BENCH_OPTIONS,
  );
});
