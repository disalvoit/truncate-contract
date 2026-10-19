# truncate

A tiny string helper that shortens a string to a hard budget and marks the cut
with an ellipsis.

## API

### `truncate(text, limit)`

Returns a string.

1. The result never contains more than `limit` Unicode code points. Code
   points, not UTF-16 code units — a single emoji counts as one.
2. If `text` already has `limit` or fewer code points, `truncate` returns
   `text` unchanged (the same string value, ellipsis-free).
3. Otherwise the result is the longest prefix of `text` of at most
   `limit - 1` code points, with any trailing whitespace removed from that
   prefix, followed by U+2026 HORIZONTAL ELLIPSIS (…). If removing trailing
   whitespace empties the prefix, the result is just the ellipsis. The result
   is therefore at most `limit` code points long — the ellipsis counts inside
   the budget, it is not added on top of it.
4. `limit` is required and must be an integer >= 1. `0`, `-1`, `2.5`, `"5"`,
   `NaN`, `Infinity`, `null`, `undefined` and a missing argument are all
   `TypeError`.
5. `text` must be a string; anything else is a `TypeError`.

## Examples

```js
truncate("hello world", 5); // "hell…"
truncate("hello", 5);       // "hello"
truncate("😀😀😀", 2);      // "😀…"
```

## Held-out grade

`held-out/ep4.test.mjs` is the suite the episode grades against — the tests the
models never saw. Run it with `node --test held-out/`. On the shipped `main` it
passes 4 of 20 checks; the contract it grades against is `README.md`, not the
issue's example.
