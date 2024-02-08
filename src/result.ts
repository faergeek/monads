import { Maybe } from './maybe';

/**
 * An abstract box representing success or failure.
 * Provides various ways to perform operations on either of those state,
 * without explicitly checking for it.
 */
export class Result<T, E> {
  #state;

  private constructor(
    state: { isOk: true; value: T } | { isOk: false; err: E },
  ) {
    this.#state = state;
  }

  /**
   * Create a box representing failure
   */
  static Err<const E>(err: E) {
    return new Result<never, E>({ isOk: false, err });
  }

  /**
   * Create a box representing success
   */
  static Ok<T>(value: T) {
    return new Result<T, never>({ isOk: true, value });
  }

  /**
   * Combine record of boxes and return either record with their unboxed values
   * if all boxes represent a success or the first box representing failure
   * otherwise
   */
  static all<T extends Readonly<Record<string, Result<unknown, unknown>>>>(
    xs: T,
  ): Result<
    { [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never },
    {
      [K in keyof T]: T[K] extends Result<unknown, infer F> ? F : never;
    }[keyof T]
  > {
    const result: Record<string, unknown> = {};

    for (const [key, x] of Object.entries(xs)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!x.#state.isOk) return x as any;
      result[key] = x.#state.value;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Result.Ok(result as any);
  }

  /**
   * Unpack the box. Requires explicit handling of both success and failure.
   * This is used to implement most of the operations
   */
  match<U, F = U>(arms: { Ok: (value: T) => U; Err: (value: E) => F }) {
    return this.#state.isOk
      ? arms.Ok(this.#state.value)
      : arms.Err(this.#state.err);
  }

  /**
   * Apply an arbitrary transformation to a success value inside the box and
   * return a new box containing the result of that transformation.
   * `f` accepts an existing value. Returned value will be put inside the new
   * box representing success. Not called if a box represents failure
   */
  mapOk<U>(f: (value: T) => U) {
    return this.match<Result<U, E>>({
      Err: Result.Err,
      Ok: value => Result.Ok(f(value)),
    });
  }

  /**
   * Apply an arbitrary transformation to a failure value inside the box and
   * return a new box containing the result of that transformation.
   * `f` accepts an existing value. Returned value will be put inside the new
   * box representing failure. Not called if a box represents success
   */
  mapErr<F>(f: (err: E) => F) {
    return this.match<Result<T, F>>({
      Ok: Result.Ok,
      Err: err => Result.Err(f(err)),
    });
  }

  /**
   * Apply an arbitrary transformation to a success value inside the box and
   * return a new box with the result of that transformation.
   * As opposed to `mapOk`, `f` is required to return a new box, not just a
   * value.
   * This can be useful if you want to turn `Result.Ok` into `Result.Err`
   * depending on it's value
   */
  flatMapOk<U, F>(f: (value: T) => Result<U, F>) {
    return this.match<Result<U, E | F>>({
      Err: Result.Err,
      Ok: value => f(value),
    });
  }

  /**
   * Turn this `Result` into a `Maybe` of a success value.
   */
  getOk() {
    return this.match<Maybe<T>>({
      Ok: Maybe.Some,
      Err: () => Maybe.None,
    });
  }

  /**
   * Turn this `Result` into a `Maybe` of a failure value.
   */
  getErr() {
    return this.match<Maybe<E>>({
      Ok: () => Maybe.None,
      Err: Maybe.Some,
    });
  }

  /**
   * Return a boxed success value or throw an error if box is in failure state
   */
  assertOk(message = 'Assertion failed') {
    return this.match({
      Ok: value => value,
      Err: cause => {
        throw new Error(message, { cause });
      },
    });
  }
}
