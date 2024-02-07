/**
 * An abstract box representing either presence or absence of a value.
 * Provides various ways to perform operations on that value the same way, no
 * matter if it is actually there or not
 */
export class Maybe<T> {
  #state;

  private constructor(
    state: Readonly<{ isSome: false } | { isSome: true; value: Readonly<T> }>,
  ) {
    this.#state = state;
  }

  /**
   * Represents an absence of a value
   */
  static None = new Maybe<never>({ isSome: false });

  /**
   * Create a box containing some value
   */
  static Some<T>(value: T) {
    return new Maybe<T>({ isSome: true, value });
  }

  /**
   * Combine record of boxes and return either record with their unboxed values
   * if all values are there or `Maybe.None` otherwise
   */
  static all<T extends Readonly<Record<string, Maybe<unknown>>>>(
    xs: T,
  ): Maybe<{ [K in keyof T]: T[K] extends Maybe<infer U> ? U : never }> {
    const result: Record<string, unknown> = {};

    for (const [key, x] of Object.entries(xs)) {
      if (!x.#state.isSome) return Maybe.None;
      result[key] = x.#state.value;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Maybe.Some(result as any);
  }

  /**
   * Unpack the box. Requires explicit handling of presence or absence of a
   * value.
   * This is used to implement most of the operations
   */
  match<U, N>(arms: { None: () => N; Some: (value: T) => U }) {
    return this.#state.isSome ? arms.Some(this.#state.value) : arms.None();
  }

  /**
   * Apply an arbitrary transformation to a value inside the box and return a
   * new box containing the result of that transformation.
   * `f` accepts an existing value. Returned value will be put inside the new
   * box. Not called if there is no value
   */
  mapSome<U>(f: (value: T) => U) {
    return this.match({
      Some: value => Maybe.Some(f(value)),
      None: () => Maybe.None,
    });
  }

  /**
   * Apply an arbitrary transformation to a value inside the box and return a
   * new box with the result of that transformation.
   * As opposed to `mapSome`, `f` is required to return a new box, not just a
   * value.
   * This can be useful if you want to turn `Maybe.Some` into `Maybe.None`
   * depending on it's value
   */
  flatMapSome<U>(f: (value: T) => Maybe<U>) {
    return this.match({
      Some: value => f(value),
      None: () => Maybe.None,
    });
  }

  /**
   * Return either a boxed value or a value return by `d` if there is none
   */
  getOr<U>(d: () => T | U) {
    return this.match({
      Some: value => value,
      None: d,
    });
  }

  /**
   * Return either a boxed value or `null` if there is none
   */
  toNullable() {
    return this.getOr(() => null);
  }

  /**
   * Return either a boxed value or `undefined` if there is none
   */
  toOptional() {
    return this.getOr(() => undefined);
  }

  /**
   * Return a boxed value or throw an error if there is none
   */
  assertSome(message = 'Assertion failed') {
    return this.match({
      Some: value => value,
      None: () => {
        throw new Error(message);
      },
    });
  }
}
