import { Result } from './result.js';

const OK = 'Ok';
type OK = typeof OK;

const ERR = 'Err';
type ERR = typeof ERR;

const SYNC = 'Sync';
type SYNC = typeof SYNC;

const ASYNC = 'Async';
type ASYNC = typeof ASYNC;

const GET_ENV = Symbol();
type GET_ENV = typeof GET_ENV;

export class Fx<T = never, E = never, R = unknown> {
  #v;

  private constructor(
    value:
      | { tag: OK; value: T }
      | { tag: ERR; err: E }
      | { tag: SYNC; f: (env: R) => Fx<T, E, R> }
      | { tag: ASYNC; f: (env: R) => Promise<Fx<T, E, R>> },
  ) {
    this.#v = value;
  }

  static Ok<T = never>(value: T) {
    return new Fx<T>({ tag: OK, value });
  }

  static Err<const E = never>(err: E) {
    return new Fx<never, E>({ tag: ERR, err });
  }

  static Sync<T = never, const E = never, R = unknown>(
    f: (env: R) => Fx<T, E, R>,
  ) {
    return new Fx<T, E, R>({ tag: SYNC, f });
  }

  static Async<T = never, const E = never, R = unknown>(
    f: (env: R) => Promise<Fx<T, E, R>>,
  ) {
    return new Fx<T, E, R>({ tag: ASYNC, f });
  }

  static ask<R>() {
    return Fx.Sync<R, never, R>(Fx.Ok);
  }

  static of = Fx.Ok;

  static do<T, E, R>(f: () => AsyncGenerator<E | GET_ENV, Fx<T, E, R>, R>) {
    return Fx.Async<T, E, R>(async env => {
      const gen = f();

      let result = await gen.next();
      while (!result.done) {
        if (result.value === GET_ENV) {
          result = await gen.next(env);
        } else {
          result = await gen.return(new Fx({ tag: ERR, err: result.value }));
        }
      }

      return result.value;
    });
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<E | GET_ENV, T, R> {
    const v = this.#v;

    switch (v.tag) {
      case OK:
        return v.value;
      case ERR:
        yield v.err;
        throw v.err;
      case SYNC:
        return yield* v.f(yield GET_ENV);
      case ASYNC:
        return yield* await v.f(yield GET_ENV);
    }
  }

  flatMap<U, F, S>(f: (x: T) => Fx<U, F, S>): Fx<U, E | F, R & S> {
    const v = this.#v;

    switch (v.tag) {
      case OK:
        return f(v.value);
      case ERR:
        return Fx.Err(v.err);
      case SYNC:
        return Fx.Sync(env => v.f(env).flatMap(f));
      case ASYNC: {
        return Fx.Async(env => v.f(env).then(fx => fx.flatMap(f)));
      }
    }
  }

  async run(env: R): Promise<Result<T, E>> {
    const v = this.#v;

    switch (v.tag) {
      case OK:
        return Promise.resolve(Result.Ok(v.value));
      case ERR:
        return Promise.resolve(Result.Err(v.err));
      case SYNC:
        return v.f(env).run(env);
      case ASYNC: {
        const fx = await v.f(env);
        return fx.run(env);
      }
    }
  }
}
