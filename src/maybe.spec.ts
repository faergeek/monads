import { describe, expect, expectTypeOf, it } from 'vitest';

import { Maybe } from './maybe';

describe('Maybe', () => {
  it('.None', () => {
    const matched = Maybe.None.match({
      None: () => 0,
      Some: value => value,
    });

    expectTypeOf(matched).toEqualTypeOf<number>();
    expect(matched).toBe(0);
  });

  it('.Some', () => {
    const matched = Maybe.Some(42).match({
      None: () => undefined,
      Some: value => value,
    });

    expectTypeOf(matched).toEqualTypeOf<number | undefined>();
    expect(matched).toBe(42);
  });

  it('#mapSome', () => {
    const matched = Maybe.None.mapSome(() => 42).match({
      None: () => 0,
      Some: value => value,
    });

    expectTypeOf(matched).toEqualTypeOf<number>();
    expect(matched).toBe(0);
  });

  it('#flatMapSome', () => {
    const matched = Maybe.Some('anything')
      .flatMapSome(s => (s === 'something' ? Maybe.Some(s) : Maybe.None))
      .match({
        None: () => 'nothing',
        Some: value => value,
      });

    expectTypeOf(matched).toEqualTypeOf<string>();
    expect(matched).toBe('nothing');
  });

  it('#getOr', () => {
    const someValue = Maybe.Some(42).getOr(() => 13);
    expectTypeOf(someValue).toEqualTypeOf<number>();
    expect(someValue).toBe(42);

    const someValueWithDifferentFallbackType = Maybe.Some(42).getOr(
      () => 'nothing',
    );
    expectTypeOf(someValueWithDifferentFallbackType).toEqualTypeOf<
      number | string
    >();
    expect(someValueWithDifferentFallbackType).toBe(42);

    const noneValue = Maybe.None.getOr(() => 42);
    expectTypeOf(noneValue).toEqualTypeOf<number>();
    expect(noneValue).toBe(42);
  });

  it('#toNullable', () => {
    const someValue = Maybe.Some(42).toNullable();
    expectTypeOf(someValue).toEqualTypeOf<number | null>();
    expect(someValue).toBe(42);

    const noneValue = Maybe.None.toNullable();
    expectTypeOf(noneValue).toEqualTypeOf<null>();
    expect(noneValue).toBe(null);
  });

  it('#toOptional', () => {
    const someValue = Maybe.Some(42).toOptional();
    expectTypeOf(someValue).toEqualTypeOf<number | undefined>();
    expect(someValue).toBe(42);

    const noneValue = Maybe.None.toOptional();
    expectTypeOf(noneValue).toEqualTypeOf<undefined>();
    expect(noneValue).toBe(undefined);
  });

  it('#assertSome', () => {
    const someValue = Maybe.Some(42).assertSome();
    expectTypeOf(someValue).toEqualTypeOf<number>();
    expect(someValue).toBe(42);

    expect(() => Maybe.None.assertSome()).toThrow(
      new Error('Assertion failed'),
    );

    expect(() => Maybe.None.assertSome('Value is missing')).toThrow(
      new Error('Value is missing'),
    );
  });

  it('.all', () => {
    const all = Maybe.all({
      42: Maybe.Some(42),
      string: Maybe.Some('string'),
    }).toNullable();

    expectTypeOf(all).toEqualTypeOf<{ 42: number; string: string } | null>();
    expect(all).toStrictEqual({ 42: 42, string: 'string' });

    const notAll = Maybe.all({
      42: Maybe.Some(42),
      none: Maybe.None,
    }).toNullable();

    expectTypeOf(notAll).toEqualTypeOf<{ 42: number; none: never } | null>();
    expect(notAll).toBe(null);
  });
});
