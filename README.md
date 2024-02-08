# @faergeek/monads

Easy to use monads for JavaScript and TypeScript.

Source code itself is pretty small, but it has jsdoc comments, which should
serve as a more complete API documentation:

- [Maybe](./src/maybe.ts)

  An abstract box representing either presence or absence of a value.

  A box with a value can be created with `Maybe.Some(<value>)`. `Maybe.None`
  represents an absence of a value.

  Read the comments in source file linked above for details.

- [Async](./src/async.ts)

  An abstract box representing asynchronous value state. Very similar to
  `Maybe`, but has less operations. It exists to make sure that
  presence/absence of a value and pending/ready state are easy to tell apart.
  Very useful to convey loading state through any value transformations.

  A box with a value ready to be used can be created with
  `Async.Ready(<value>)`. `Async.Pending` represents a pending state meaning
  there's no value yet.

  Read the comments in source file linked above for details.

- [Result](./src/result.ts)

  An abstract box representing success or failure.

  A box representing success can be created with `Result.Ok(<value>)`.
  A box representing failure can be created with `Result.Err(<error>)`.

  Read the comments in source file linked above for details.

An example of using both `Async` and `Result` to represent different states of
UI depending on API request result from a hook like SWR or React Query.

First, we need to create a box, representing 3 states: pending, success and
failure.

```javascript
// let's assume data is something like a number 21
const { data, error, isLoading } = useSomeApiHook();

const halfTheAnswer = data
  ? Async.Ready(Result.Ok(data))
  : isLoading
    ? Async.Pending
    : Async.Ready(Result.Err(error));
```

Then apply transformations with `map*` or `flatMap*` functions.

Here we simply multiply the value by 2. But the same approach can be used to extract
only some pieces of response data, transform them and pass to child components,
all without loosing request state attached to it.

```javascript
const theAnswer = halfTheAnswer.mapReady(
  // this function is only called if `halfTheAnswer` represents ready state
  result =>
    result.mapOk(
      // this function is only called if `result` represents success state
      x => x * 2,
    ),
);
```

And finally use the value, explicitly handling all cases. In this example, we
simply render a piece of UI with something like React.

```javascript
return theAnswer.match({
  Pending: () => <h1>Fetching the answer, please wait...</h1>,
  Ready: result =>
    result.match({
      Err: error => <h1>Could not get the answer: {error.message}</h1>,
      Ok: data => <h1>The Answer is {data}</h1>,
    }),
});
```
