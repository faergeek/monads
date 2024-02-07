import { Maybe } from './maybe';

/**
 * An abstract box representing asynchronous value state.
 * Provides various ways to perform operations on that value the same way, no
 * matter if value is ready or still pending.
 *
 * Very similar to `Maybe`, but has less operations. It exists to make sure
 * that presence/absence of a value and pending/ready state are easy to tell
 * apart. Very useful to convey loading state through any value
 * transformations.
 */
export class Async<T> {
  #state;

  private constructor(
    state: Readonly<{ isReady: false } | { isReady: true; value: T }>,
  ) {
    this.#state = state;
  }

  /**
   * Represents a pending value
   */
  static Pending = new Async<never>({ isReady: false });

  /**
   * Create a box containing value ready to be used
   */
  static Ready<T>(value: T) {
    return new Async<T>({ isReady: true, value });
  }

  /**
   * Combine record of boxes and return either record with their unboxed values
   * if all values are ready or `Async.Pending` otherwise
   */
  static all<T extends Readonly<Record<string, Async<unknown>>>>(
    xs: T,
  ): Async<{
    [K in keyof T]: T[K] extends Async<infer U> ? U : never;
  }> {
    const result: Record<string, unknown> = {};

    for (const [key, x] of Object.entries(xs)) {
      if (!x.#state.isReady) return Async.Pending;
      result[key] = x.#state.value;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Async.Ready(result as any);
  }

  /**
   * Unpack the box. Requires explicit handling of both pending and ready
   * values.
   * This is used to implement most of the operations
   */
  match<U, P>(arms: { Pending: () => P; Ready: (value: T) => U }) {
    return this.#state.isReady ? arms.Ready(this.#state.value) : arms.Pending();
  }

  /**
   * Apply an arbitrary transformation to a value inside the box and return a
   * new box containing the result of that transformation.
   * `f` accepts an existing value. Returned value will be put inside the new
   * box. Not called if value is still pending
   */
  mapReady<U>(f: (value: T) => U) {
    return this.match({
      Ready: value => Async.Ready(f(value)),
      Pending: () => Async.Pending,
    });
  }

  /**
   * Apply an arbitrary transformation to a value inside the box and return a
   * new box with the result of that transformation.
   * As opposed to `mapReady`, `f` is required to return a new box, not just a
   * value.
   * This can be useful if you want to turn `Async.Ready` into `Async.Pending`
   * depending on it's value
   */
  flatMapReady<U>(f: (value: T) => Async<U>) {
    return this.match({
      Ready: value => f(value),
      Pending: () => Async.Pending,
    });
  }

  /**
   * Turn this `Async` into a `Maybe`.
   * It's a good idea to only do it before actually using the value. If done
   * right away it throws away useful semantic difference between `Maybe` and
   * `Async`
   */
  getReady() {
    return this.match({
      Pending: () => Maybe.None,
      Ready: Maybe.Some,
    });
  }
}
