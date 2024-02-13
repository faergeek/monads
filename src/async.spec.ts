import { describe, expect, expectTypeOf, it } from 'vitest';

import { Async } from './async.js';

describe('Async', () => {
  it('.Pending', () => {
    const matched = Async.Pending.match({
      Pending: () => undefined,
      Ready: value => value,
    });

    expectTypeOf(matched).toEqualTypeOf<undefined>();
    expect(matched).toBe(undefined);
  });

  it('.Ready', () => {
    const matched = Async.Ready(42).match({
      Pending: () => undefined,
      Ready: value => value,
    });

    expectTypeOf(matched).toEqualTypeOf<number | undefined>();
    expect(matched).toBe(42);
  });

  it('#mapReady', () => {
    expectTypeOf(Async.Pending.mapReady(() => 42)).toEqualTypeOf<
      Async<number>
    >();

    const matched = Async.Pending.mapReady(() => 42).match({
      Pending: () => 0,
      Ready: value => value,
    });

    expectTypeOf(matched).toEqualTypeOf<number>();
    expect(matched).toBe(0);
  });

  it('#flatMapReady', () => {
    expectTypeOf(
      Async.Ready('anything').flatMapReady(s =>
        s === 'something' ? Async.Ready(s) : Async.Pending,
      ),
    ).toEqualTypeOf<Async<string>>();

    const matched = Async.Ready('anything')
      .flatMapReady(s => (s === 'something' ? Async.Ready(s) : Async.Pending))
      .match({
        Pending: () => 'still loading',
        Ready: value => value,
      });

    expectTypeOf(matched).toEqualTypeOf<string>();
    expect(matched).toBe('still loading');
  });

  it('#getReady', () => {
    const matched = Async.Pending.getReady().match({
      None: () => 'nothing',
      Some: value => value,
    });

    expectTypeOf(matched).toEqualTypeOf<string>();
    expect(matched).toBe('nothing');
  });

  it('.all', () => {
    const all = Async.all({
      42: Async.Ready(42),
      string: Async.Ready('string'),
    })
      .getReady()
      .toNullable();

    expectTypeOf(all).toEqualTypeOf<{ 42: number; string: string } | null>();
    expect(all).toStrictEqual({ 42: 42, string: 'string' });

    const notAll = Async.all({
      42: Async.Ready(42),
      none: Async.Pending,
    })
      .getReady()
      .toNullable();

    expectTypeOf(notAll).toEqualTypeOf<{ 42: number; none: never } | null>();
    expect(notAll).toBe(null);
  });
});
