import { test } from "node:test";
import assert from "node:assert/strict";
import { truncate } from "../src/truncate.js";

test("returns a string", () => {
  assert.equal(typeof truncate("hello world", 5), "string");
});

test("empty string is returned unchanged", () => {
  assert.equal(truncate("", 5), "");
});

test("text shorter than the limit is returned unchanged", () => {
  assert.equal(truncate("hi", 5), "hi");
});

test("text exactly the limit is returned unchanged", () => {
  const text = "hello";
  assert.equal(truncate(text, 5), text);
});

test("longer text ends with the ellipsis", () => {
  assert.ok(truncate("hello world", 5).endsWith("\u2026"));
});

test("longer text keeps its first three characters", () => {
  assert.ok(truncate("hello world", 5).startsWith("hel"));
});

test("truncated result is shorter than the input", () => {
  const text = "hello world";
  assert.ok(truncate(text, 5).length < text.length);
});

test("limit of 1 yields a short, ellipsis-terminated result", () => {
  const r = truncate("hello", 1);
  assert.ok(r.endsWith("\u2026"));
  assert.ok(r.length <= 2);
});

test("the appended mark is U+2026 HORIZONTAL ELLIPSIS", () => {
  const r = truncate("hello world", 5);
  assert.equal([...r].at(-1), "\u2026");
});

test("a generous limit returns the whole string unchanged", () => {
  assert.equal(truncate("short", 100), "short");
});

// Regression tests: the old implementation returned `limit + 1` code points
// (the ellipsis was added on top of the budget) and accepted any `limit`.

test("the ellipsis counts inside the budget, not on top of it", () => {
  const r = truncate("abcdefghij", 5);
  assert.equal(r, "abcd…");
  assert.equal([...r].length, 4 + 1);
  assert.ok([...r].length <= 5);
});

test("truncated result never exceeds limit code points", () => {
  for (const limit of [1, 2, 3, 5, 8]) {
    const r = truncate("hello world, this is a longer sentence", limit);
    assert.ok([...r].length <= limit, `limit ${limit} gave ${r}`);
  }
});

test("counts code points, not UTF-16 units", () => {
  assert.equal(truncate("😀😀😀", 2), "😀…");
  assert.equal(truncate("😀😀😀", 3), "😀😀😀");
  assert.equal([...truncate("😀😀😀😀😀", 4)].length, 4);
});

test("strips trailing whitespace from the kept prefix", () => {
  assert.equal(truncate("hello  world", 8), "hello…");
  assert.equal(truncate("abcd efgh", 6), "abcd…");
  assert.equal(truncate("one two three", 5), "one…"); // prefix "one " -> "one"
});

test("emptied prefix yields just the ellipsis", () => {
  assert.equal(truncate(" aaaa", 2), "…");
  assert.equal(truncate("hello", 1), "…");
});

test("non-positive, non-integer, non-number and missing limits throw TypeError", () => {
  for (const bad of [0, -1, 2.5, "5", NaN, Infinity, -Infinity, null, undefined]) {
    assert.throws(
      () => truncate("hello world", bad),
      TypeError,
      `limit ${String(bad)} should throw TypeError`
    );
  }
  assert.throws(() => truncate("hello world"), TypeError);
});

test("non-string text throws TypeError", () => {
  for (const bad of [null, undefined, 42, {}, [], true, Symbol("s")]) {
    assert.throws(() => truncate(bad, 5), TypeError);
  }
});
