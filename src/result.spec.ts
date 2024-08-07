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
    const matched1 = Result.Ok('anything').flatMapOk(s =>
      s === 'anything' ? Result.Ok(42) : Result.Err('No'),
    );

    expectTypeOf(matched1).toEqualTypeOf<Result<number, 'No'>>();
    expect(matched1.match({ Err: err => err, Ok: value => value })).toBe(42);

    const matched2 = Result.Err('input-error').flatMapOk(value =>
      value === 'anything' ? Result.Ok(42) : Result.Err('something'),
    );

    expectTypeOf(matched2).toEqualTypeOf<
      Result<number, 'input-error' | 'something'>
    >();

    expect(matched2.match({ Err: err => err, Ok: value => value })).toBe(
      'input-error',
    );
  });

  it('#flatMapErr', () => {
    const matched1 = Result.Err<'input-error' | 'critical-error'>(
      'input-error',
    ).flatMapErr(err =>
      err === 'input-error' ? Result.Ok(42) : Result.Err(err),
    );

    expectTypeOf(matched1).toEqualTypeOf<Result<number, 'critical-error'>>();
    expect(matched1.match({ Err: err => err, Ok: value => value })).toBe(42);

    const matched2 = Result.Ok('42').flatMapErr(err =>
      err === 'input-error' ? Result.Ok(42) : Result.Err('error'),
    );

    expectTypeOf(matched2).toEqualTypeOf<Result<number | string, 'error'>>();
    expect(matched2.match({ Err: err => err, Ok: value => value })).toBe('42');
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
    expect(notAll).toBeNull();
  });
});
