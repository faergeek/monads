# @faergeek/monads

Easy to use monads for JavaScript and TypeScript

<!-- TSDOC_START -->

## :factory: Maybe

An abstract box representing either presence or absence of a value.
Provides various ways to perform operations on that value the same way, no
matter if it is actually there or not

### Methods

- [Some](#gear-some)
- [all](#gear-all)
- [match](#gear-match)
- [mapSome](#gear-mapsome)
- [flatMapSome](#gear-flatmapsome)
- [getOr](#gear-getor)
- [toNullable](#gear-tonullable)
- [toOptional](#gear-tooptional)
- [assertSome](#gear-assertsome)

#### :gear: Some

Create a box containing some value

| Method | Type |
| ---------- | ---------- |
| `Some` | `<T>(value: T) => Maybe<T>` |

#### :gear: all

Combine record of boxes and return either record with their unboxed values
if all values are there or `Maybe.None` otherwise

| Method | Type |
| ---------- | ---------- |
| `all` | `<T extends Readonly<Record<string, Maybe<unknown>>>>(xs: T) => Maybe<{ [K in keyof T]: T[K] extends Maybe<infer U> ? U : never; }>` |

#### :gear: match

Unpack the box. Requires explicit handling of presence or absence of a
value.
This is used to implement most of the operations

| Method | Type |
| ---------- | ---------- |
| `match` | `<U, N>(arms: { None: () => N; Some: (value: T) => U; }) => U or N` |

#### :gear: mapSome

Apply an arbitrary transformation to a value inside the box and return a
new box containing the result of that transformation.
`f` accepts an existing value. Returned value will be put inside the new
box. Not called if there is no value

| Method | Type |
| ---------- | ---------- |
| `mapSome` | `<U>(f: (value: T) => U) => Maybe<never> or Maybe<U>` |

#### :gear: flatMapSome

Apply an arbitrary transformation to a value inside the box and return a
new box with the result of that transformation.
As opposed to `mapSome`, `f` is required to return a new box, not just a
value.
This can be useful if you want to turn `Maybe.Some` into `Maybe.None`
depending on it's value

| Method | Type |
| ---------- | ---------- |
| `flatMapSome` | `<U>(f: (value: T) => Maybe<U>) => Maybe<never> or Maybe<U>` |

#### :gear: getOr

Return either a boxed value or a value return by `d` if there is none

| Method | Type |
| ---------- | ---------- |
| `getOr` | `<U>(d: () => T or U) => T | U` |

#### :gear: toNullable

Return either a boxed value or `null` if there is none

| Method | Type |
| ---------- | ---------- |
| `toNullable` | `() => any` |

#### :gear: toOptional

Return either a boxed value or `undefined` if there is none

| Method | Type |
| ---------- | ---------- |
| `toOptional` | `() => any` |

#### :gear: assertSome

Return a boxed value or throw an error if there is none

| Method | Type |
| ---------- | ---------- |
| `assertSome` | `(message?: string) => T` |


## :factory: Async

An abstract box representing asynchronous value state.
Provides various ways to perform operations on that value the same way, no
matter if value is ready or still pending.

Very similar to `Maybe`, but has less operations. It exists to make sure
that presence/absence of a value and pending/ready state are easy to tell
apart. Very useful to convey loading state through any value
transformations.

### Methods

- [Ready](#gear-ready)
- [all](#gear-all)
- [match](#gear-match)
- [mapReady](#gear-mapready)
- [flatMapReady](#gear-flatmapready)
- [getReady](#gear-getready)

#### :gear: Ready

Create a box containing value ready to be used

| Method | Type |
| ---------- | ---------- |
| `Ready` | `<T>(value: T) => Async<T>` |

#### :gear: all

Combine record of boxes and return either record with their unboxed values
if all values are ready or `Async.Pending` otherwise

| Method | Type |
| ---------- | ---------- |
| `all` | `<T extends Readonly<Record<string, Async<unknown>>>>(xs: T) => Async<{ [K in keyof T]: T[K] extends Async<infer U> ? U : never; }>` |

#### :gear: match

Unpack the box. Requires explicit handling of both pending and ready
values.
This is used to implement most of the operations

| Method | Type |
| ---------- | ---------- |
| `match` | `<U, P>(arms: { Pending: () => P; Ready: (value: T) => U; }) => U or P` |

#### :gear: mapReady

Apply an arbitrary transformation to a value inside the box and return a
new box containing the result of that transformation.
`f` accepts an existing value. Returned value will be put inside the new
box. Not called if value is still pending

| Method | Type |
| ---------- | ---------- |
| `mapReady` | `<U>(f: (value: T) => U) => Async<never> or Async<U>` |

#### :gear: flatMapReady

Apply an arbitrary transformation to a value inside the box and return a
new box with the result of that transformation.
As opposed to `mapReady`, `f` is required to return a new box, not just a
value.
This can be useful if you want to turn `Async.Ready` into `Async.Pending`
depending on it's value

| Method | Type |
| ---------- | ---------- |
| `flatMapReady` | `<U>(f: (value: T) => Async<U>) => Async<never> or Async<U>` |

#### :gear: getReady

Turn this `Async` into a `Maybe`.
It's a good idea to only do it before actually using the value. If done
right away it throws away useful semantic difference between `Maybe` and
`Async`

| Method | Type |
| ---------- | ---------- |
| `getReady` | `() => Maybe<never> or Maybe<T>` |


## :factory: Result

An abstract box representing success or failure.
Provides various ways to perform operations on either of those state,
without explicitly checking for it.

### Methods

- [Err](#gear-err)
- [Ok](#gear-ok)
- [all](#gear-all)
- [match](#gear-match)
- [mapOk](#gear-mapok)
- [mapErr](#gear-maperr)
- [flatMapOk](#gear-flatmapok)
- [getOk](#gear-getok)
- [getErr](#gear-geterr)
- [assertOk](#gear-assertok)

#### :gear: Err

Represents a failure

| Method | Type |
| ---------- | ---------- |
| `Err` | `<const E>(err: E) => Result<never, E>` |

#### :gear: Ok

Represents a success

| Method | Type |
| ---------- | ---------- |
| `Ok` | `<T>(value: T) => Result<T, never>` |

#### :gear: all

| Method | Type |
| ---------- | ---------- |
| `all` | `<T extends Readonly<Record<string, Result<unknown, unknown>>>>(xs: T) => Result<{ [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never; }, { [K in keyof T]: T[K] extends Result<...> ? F : never; }[keyof T]>` |

#### :gear: match

Unpack the box. Requires explicit handling of both success and failure.
This is used to implement most of the operations

| Method | Type |
| ---------- | ---------- |
| `match` | `<U, F = U>(arms: { Ok: (value: T) => U; Err: (value: E) => F; }) => U or F` |

#### :gear: mapOk

Apply an arbitrary transformation to a success value inside the box and
return a new box containing the result of that transformation.
`f` accepts an existing value. Returned value will be put inside the new
box representing success. Not called if a box represents failure

| Method | Type |
| ---------- | ---------- |
| `mapOk` | `<U>(f: (value: T) => U) => Result<U, E>` |

#### :gear: mapErr

Apply an arbitrary transformation to a failure value inside the box and
return a new box containing the result of that transformation.
`f` accepts an existing value. Returned value will be put inside the new
box representing failure. Not called if a box represents success

| Method | Type |
| ---------- | ---------- |
| `mapErr` | `<F>(f: (err: E) => F) => Result<T, F>` |

#### :gear: flatMapOk

Apply an arbitrary transformation to a success value inside the box and
return a new box with the result of that transformation.
As opposed to `mapOk`, `f` is required to return a new box, not just a
value.
This can be useful if you want to turn `Result.Ok` into `Result.Err`
depending on it's value

| Method | Type |
| ---------- | ---------- |
| `flatMapOk` | `<U, F>(f: (value: T) => Result<U, F>) => Result<U, E or F>` |

#### :gear: getOk

Turn this `Result` into a `Maybe` of a success value.

| Method | Type |
| ---------- | ---------- |
| `getOk` | `() => Maybe<T>` |

#### :gear: getErr

Turn this `Result` into a `Maybe` of a failure value.

| Method | Type |
| ---------- | ---------- |
| `getErr` | `() => Maybe<E>` |

#### :gear: assertOk

Return a boxed success value or throw an error if box is in failure state

| Method | Type |
| ---------- | ---------- |
| `assertOk` | `(message?: string) => T` |


<!-- TSDOC_END -->
