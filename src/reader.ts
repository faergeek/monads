export class Reader<E, T> {
  private constructor(readonly run: (env: E) => T) {}

  static ask<E>() {
    return new Reader<E, E>(env => env);
  }

  static do<E, T>(f: () => Generator<void, T, E>) {
    return new Reader<E, T>(env => {
      const gen = f();

      let result = gen.next();
      while (!result.done) result = gen.next(env);

      return result.value;
    });
  }

  *[Symbol.iterator](): Generator<void, T, E> {
    return this.run(yield);
  }

  map<U>(f: (x: T) => U) {
    return new Reader<E, U>(env => f(this.run(env)));
  }

  flatMap<F, U>(f: (x: T) => Reader<F, U>) {
    return new Reader<E & F, U>(env => f(this.run(env)).run(env));
  }
}
