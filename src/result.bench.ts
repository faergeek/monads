import type { BenchOptions } from 'vitest';
import { bench, describe } from 'vitest';

import { Result } from './result.js';

const BENCH_OPTIONS: BenchOptions = {
  time: 50,
};

function returnOrFail(fail: boolean) {
  return () => (fail ? 'failed' : 21);
}

function throwing(f: ReturnType<typeof returnOrFail>) {
  return () => {
    const result = f();
    if (typeof result !== 'number') throw new Error(result);
    return result;
  };
}

function tryCatch(f: () => number) {
  try {
    return f() * 2;
  } catch {
    return null;
  }
}

function returningResult(f: ReturnType<typeof returnOrFail>) {
  return () => {
    const result = f();
    if (typeof result !== 'number') return Result.Err(result);
    return Result.Ok(result);
  };
}

function handleResultWithMap(f: () => Result<number, 'failed'>) {
  return f().mapOk(n => n * 2);
}

function handleResultWithGenerator(f: () => Result<number, 'failed'>) {
  return Result.do(function* fn() {
    const n = yield* f();

    return Result.Ok(n * 2);
  });
}

const handleResultWithGeneratorWithArgs = Result.doWithArgs(function* fn(
  f: () => Result<number, 'failed'>,
) {
  const n = yield* f();

  return Result.Ok(n * 2);
});

describe('error handling', () => {
  bench(
    'try/catch (success)',
    () => {
      tryCatch(throwing(returnOrFail(false)));
    },
    BENCH_OPTIONS,
  );

  bench(
    'try/catch (failure)',
    () => {
      tryCatch(throwing(returnOrFail(true)));
    },
    BENCH_OPTIONS,
  );

  bench(
    'result with map (success)',
    () => {
      handleResultWithMap(returningResult(returnOrFail(false)));
    },
    BENCH_OPTIONS,
  );

  bench(
    'result with map (failure)',
    () => {
      handleResultWithMap(returningResult(returnOrFail(true)));
    },
    BENCH_OPTIONS,
  );

  bench(
    'result with generator (success)',
    () => {
      handleResultWithGenerator(returningResult(returnOrFail(false)));
    },
    BENCH_OPTIONS,
  );

  bench(
    'result with generator (failure)',
    () => {
      handleResultWithGenerator(returningResult(returnOrFail(true)));
    },
    BENCH_OPTIONS,
  );

  bench(
    'result with generator with args (success)',
    () => {
      handleResultWithGeneratorWithArgs(returningResult(returnOrFail(false)));
    },
    BENCH_OPTIONS,
  );

  bench(
    'result with generator with args (failure)',
    () => {
      handleResultWithGeneratorWithArgs(returningResult(returnOrFail(true)));
    },
    BENCH_OPTIONS,
  );
});
