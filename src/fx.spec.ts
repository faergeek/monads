import { expect, expectTypeOf, test } from 'vitest';

import { Fx } from './fx.js';
import type { Result } from './result.js';

test('Fx.Ok#run', async () => {
  const fx = Fx.Ok(42);
  expectTypeOf(fx).toEqualTypeOf<Fx<number>>();
  expectTypeOf(fx.run).toEqualTypeOf<
    (env: unknown) => Promise<Result<number>>
  >();

  const result = await fx.run(null);
  expectTypeOf(result).toEqualTypeOf<Result<number>>();
  result.match({
    Err: expect.fail,
    Ok: value => expect(value).toBe(42),
  });
});

test('Fx.Err#run', async () => {
  const fx = Fx.Err('foo');
  expectTypeOf(fx).toEqualTypeOf<Fx<never, 'foo'>>();
  expectTypeOf(fx.run).toEqualTypeOf<
    (env: unknown) => Promise<Result<never, 'foo'>>
  >();

  const result = await fx.run(null);
  expectTypeOf(result).toEqualTypeOf<Result<never, 'foo'>>();
  result.match({
    Err: err => expect(err).toBe('foo'),
    Ok: expect.fail,
  });
});

test('Fx.async', async () => {
  function getNumber() {
    return Fx.ask<{ numbers: number[] }>().flatMap(({ numbers }) => {
      const n = numbers.shift();

      if (n == null) {
        return Fx.Err('ran-out-of-numbers');
      }

      return Fx.Ok(n);
    });
  }

  expectTypeOf(getNumber).toEqualTypeOf<
    () => Fx<number, 'ran-out-of-numbers', { numbers: number[] }>
  >();

  function getString() {
    return Fx.do(async function* f() {
      const { strings } = yield* Fx.ask<{ strings: string[] }>();

      const s = strings.shift();

      if (s == null) {
        return Fx.Err('ran-out-of-strings');
      }

      return Fx.Ok(s);
    });
  }

  expectTypeOf(getString).toEqualTypeOf<
    () => Fx<string, 'ran-out-of-strings', { strings: string[] }>
  >();

  function sleep(ms: number) {
    return Fx.Async<void>(
      () =>
        new Promise(resolve => {
          setTimeout(() => resolve(Fx.Ok(undefined)), ms);
        }),
    );
  }

  expectTypeOf(sleep).toEqualTypeOf<(ms: number) => Fx<void>>();

  const fx = Fx.do(async function* f() {
    const n = yield* getNumber();
    const s = yield* getString();
    yield* sleep(500);

    return Fx.Ok(`${s}: ${n}`);
  });

  expectTypeOf(fx).toEqualTypeOf<
    Fx<
      string,
      'ran-out-of-numbers' | 'ran-out-of-strings',
      { numbers: number[] } & { strings: string[] }
    >
  >();

  expectTypeOf(fx.run).toEqualTypeOf<
    (
      env: { numbers: number[] } & { strings: string[] },
    ) => Promise<Result<string, 'ran-out-of-numbers' | 'ran-out-of-strings'>>
  >();

  const result = await fx.run({ numbers: [42], strings: ['foo'] });
  expectTypeOf(result).toEqualTypeOf<
    Result<string, 'ran-out-of-numbers' | 'ran-out-of-strings'>
  >();

  result.match({
    Err: expect.fail,
    Ok: value => expect(value).toBe('foo: 42'),
  });

  await fx.run({ numbers: [42], strings: [] }).then(r =>
    r.match({
      Err: err => expect(err).toBe('ran-out-of-strings'),
      Ok: expect.fail,
    }),
  );

  await fx.run({ numbers: [], strings: ['foo'] }).then(r =>
    r.match({
      Err: err => expect(err).toBe('ran-out-of-numbers'),
      Ok: expect.fail,
    }),
  );

  await fx.run({ numbers: [], strings: [] }).then(r =>
    r.match({
      Err: err => expect(err).toBe('ran-out-of-numbers'),
      Ok: expect.fail,
    }),
  );
});
