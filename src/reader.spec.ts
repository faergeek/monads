import { expect, expectTypeOf, test, vi } from 'vitest';

import { Reader } from './reader.js';

test('.ask', () => {
  expectTypeOf(Reader.ask<number>()).toEqualTypeOf<Reader<number, number>>();

  expectTypeOf(Reader.ask<string>()).toEqualTypeOf<Reader<string, string>>();
});

test('.do', () => {
  interface GetNumberEnv {
    getNumber: () => number;
  }

  function getNumberFromEnv() {
    return Reader.do(function* f() {
      const env = yield* Reader.ask<GetNumberEnv>();
      return env.getNumber();
    });
  }

  interface GetStringEnv {
    getString: () => string;
  }

  function getStringFromEnv() {
    return Reader.do(function* f() {
      const env = yield* Reader.ask<GetStringEnv>();
      return env.getString();
    });
  }

  const getString = vi.fn(() => 'The Answer is');

  const getNumber = vi.fn<() => number>();
  getNumber.mockImplementationOnce(() => 44);
  getNumber.mockImplementationOnce(() => 2);

  const getTheAnswer = Reader.do(function* f() {
    const n = yield* getNumberFromEnv();
    const n2 = yield* getNumberFromEnv();
    const s = yield* getStringFromEnv();

    return `${s}: ${n - n2}`;
  });

  expectTypeOf(getTheAnswer).toEqualTypeOf<
    Reader<GetNumberEnv & GetStringEnv, string>
  >();

  expectTypeOf(getTheAnswer.run).toEqualTypeOf<
    (env: GetNumberEnv & GetStringEnv) => string
  >();

  expect(getTheAnswer.run({ getNumber, getString })).toBe('The Answer is: 42');

  expect(getString).toHaveBeenCalledTimes(1);
  expect(getString).toHaveBeenCalledWith();
  expect(getNumber).toHaveBeenCalledTimes(2);
  expect(getNumber).toHaveBeenNthCalledWith(1);
  expect(getNumber).toHaveBeenNthCalledWith(2);

  const unsatisfiableReader = Reader.do(function* f() {
    const s = yield* Reader.ask<string>();
    const n = yield* Reader.ask<number>();

    return n + s;
  });

  expectTypeOf(unsatisfiableReader).toEqualTypeOf<Reader<never, string>>();
  expectTypeOf(unsatisfiableReader.run).toEqualTypeOf<(env: never) => string>();
});

test('#run', () => {
  expectTypeOf(Reader.ask<number>().run).toEqualTypeOf<
    (env: number) => number
  >();

  expect(Reader.ask<number>().run(42)).toBe(42);
  expect(Reader.ask<number>().run(21)).toBe(21);

  expectTypeOf(Reader.ask<boolean>().run).toEqualTypeOf<
    (env: boolean) => boolean
  >();

  expect(Reader.ask<boolean>().run(true)).toBe(true);
  expect(Reader.ask<boolean>().run(false)).toBe(false);
});

test('#map', () => {
  const multiplyBy2 = Reader.ask<number>().map(n => n * 2);

  expectTypeOf(multiplyBy2).toEqualTypeOf<Reader<number, number>>();
  expectTypeOf(multiplyBy2.run).toEqualTypeOf<(env: number) => number>();
  expect(multiplyBy2.run(21)).toBe(42);
  expect(multiplyBy2.run(3)).toBe(6);

  const numToBool = Reader.ask<number>().map(n => 42 / n === 2);
  expectTypeOf(numToBool).toEqualTypeOf<Reader<number, boolean>>();
  expectTypeOf(numToBool.run).toEqualTypeOf<(env: number) => boolean>();
  expect(numToBool.run(21)).toBe(true);
  expect(numToBool.run(19)).toBe(false);

  const strToNum = Reader.ask<string>().map(n => Number(n));
  expectTypeOf(strToNum).toEqualTypeOf<Reader<string, number>>();
  expectTypeOf(strToNum.run).toEqualTypeOf<(env: string) => number>();
  expect(strToNum.run('34')).toBe(34);
  expect(strToNum.run('blah-blah')).toBeNaN();
});

test('#flatMap', () => {
  interface GetNumberEnv {
    getNumber: () => number;
  }

  function getNumberFromEnv() {
    return Reader.ask<GetNumberEnv>().map(env => env.getNumber());
  }

  interface GetStringEnv {
    getString: () => string;
  }

  function getStringFromEnv() {
    return Reader.ask<GetStringEnv>().map(env => env.getString());
  }

  const getString = vi.fn(() => 'The Answer is');

  const getNumber = vi.fn<() => number>();
  getNumber.mockImplementationOnce(() => 44);
  getNumber.mockImplementationOnce(() => 2);

  const getTheAnswer = getNumberFromEnv()
    .flatMap(n => getNumberFromEnv().map(n2 => n - n2))
    .flatMap(n => getStringFromEnv().map(s => `${s}: ${n}`));

  expectTypeOf(getTheAnswer).toEqualTypeOf<
    Reader<GetNumberEnv & GetStringEnv, string>
  >();

  expectTypeOf(getTheAnswer.run).toEqualTypeOf<
    (env: GetNumberEnv & GetStringEnv) => string
  >();

  expect(getTheAnswer.run({ getNumber, getString })).toBe('The Answer is: 42');

  expect(getString).toHaveBeenCalledTimes(1);
  expect(getString).toHaveBeenCalledWith();
  expect(getNumber).toHaveBeenCalledTimes(2);
  expect(getNumber).toHaveBeenNthCalledWith(1);
  expect(getNumber).toHaveBeenNthCalledWith(2);

  const unsatisfiableReader = Reader.ask<string>().flatMap(s =>
    Reader.ask<number>().map(n => n + s),
  );

  expectTypeOf(unsatisfiableReader).toEqualTypeOf<Reader<never, string>>();
  expectTypeOf(unsatisfiableReader.run).toEqualTypeOf<(env: never) => string>();
});
