import { describe, expect, expectTypeOf, it } from 'vitest';

import { Result } from './result.js';

describe('Result', () => {
  it('.Err', () => {
    const matched = Result.Err('Something went wrong').match({
      Err: err => err,
      Ok: value => value,
    });

    expectTypeOf(matched).toEqualTypeOf<'Something went wrong'>();
    expect(matched).toBe('Something went wrong');
  });

  it('.Ok', () => {
    const matched = Result.Ok(42).match({
      Err: err => err,
      Ok: value => value,
    });

    expectTypeOf(matched).toEqualTypeOf<number>();
    expect(matched).toBe(42);
  });

  it('#mapOk', () => {
    const matched = Result.Ok(21)
      .mapOk(n => n * 2)
      .match({
        Err: err => err,
        Ok: value => value,
      });

    expectTypeOf(matched).toEqualTypeOf<number>();
    expect(matched).toBe(42);
  });

  it('#mapErr', () => {
    const matched = Result.Err('Wrong')
      .mapErr(err => `Something went ${err.toLowerCase()}`)
      .match({
        Err: err => err,
        Ok: value => value,
      });

    expectTypeOf(matched).toEqualTypeOf<string>();
    expect(matched).toBe('Something went wrong');
  });

  it('#flatMapOk', () => {
    const matched = Result.Ok('anything')
      .flatMapOk(s =>
        s === 'something' ? Result.Ok(s) : Result.Err('Something failed'),
      )
      .match({
        Err: err => err,
        Ok: value => value,
      });

    expectTypeOf(matched).toEqualTypeOf<string>();
    expect(matched).toBe('Something failed');
  });

  it('#getOk', () => {
    const matchedSuccess = Result.Ok(42)
      .getOk()
      .match({
        None: () => null,
        Some: value => value,
      });

    expectTypeOf(matchedSuccess).toEqualTypeOf<number | null>();
    expect(matchedSuccess).toBe(42);

    const matchedFailure = Result.Err('Something went wrong')
      .getOk()
      .match({
        None: () => 'nothing',
        Some: value => value,
      });

    expectTypeOf(matchedFailure).toEqualTypeOf<string>();
    expect(matchedFailure).toBe('nothing');
  });

  it('#getErr', () => {
    const matchedSuccess = Result.Ok(42)
      .getErr()
      .match({
        None: () => 'nothing',
        Some: value => value,
      });

    expectTypeOf(matchedSuccess).toEqualTypeOf<string>();
    expect(matchedSuccess).toBe('nothing');

    const matchedFailure = Result.Err('Something went wrong')
      .getErr()
      .match({
        None: () => 'nothing',
        Some: value => value,
      });

    expectTypeOf(matchedFailure).toEqualTypeOf<string>();
    expect(matchedFailure).toBe('Something went wrong');
  });

  it('#assertOk', () => {
    const matchedSuccess = Result.Ok(42).assertOk();

    expectTypeOf(matchedSuccess).toEqualTypeOf<number>();
    expect(matchedSuccess).toBe(42);

    expect(() => Result.Err('error').assertOk()).toThrow(
      Error('Assertion failed'),
    );

    expect(() => Result.Err('error').assertOk('Something went wrong')).toThrow(
      Error('Something went wrong'),
    );
  });

  it('.all', () => {
    const all = Result.all({
      42: Result.Ok(42),
      string: Result.Ok('string'),
    })
      .getOk()
      .toNullable();

    expectTypeOf(all).toEqualTypeOf<{ 42: number; string: string } | null>();
    expect(all).toStrictEqual({ 42: 42, string: 'string' });

    const notAll = Result.all({
      42: Result.Ok(42),
      none: Result.Err('failure'),
    })
      .getOk()
      .toNullable();

    expectTypeOf(notAll).toEqualTypeOf<{ 42: number; none: never } | null>();
    expect(notAll).toBe(null);
  });
});
