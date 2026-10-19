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

// --- Regression tests: ellipsis counts inside the limit ---

test("regression: result respects the limit exactly (ellipsis inside the budget)", () => {
  // Per README: ellipsis counts inside the budget, so prefix is limit - 1
  // code points. The issue's "abcde…" example is 6 code points for a request
  // of 5 — exactly the old bug — and contradicts the README contract.
  assert.equal(truncate("abcdefghij", 5), "abcd\u2026");
  assert.equal(truncate("hello world", 5), "hell\u2026");
});

test("regression: result never exceeds limit code points", () => {
  for (const limit of [1, 2, 3, 7]) {
    assert.ok([...truncate("hello world", limit)].length <= limit);
  }
});

test("regression: emoji counts as one code point", () => {
  assert.equal(truncate("\u{1F600}\u{1F600}\u{1F600}", 2), "\u{1F600}\u{2026}");
});

test("regression: whitespace-only prefix collapses to bare ellipsis", () => {
  assert.equal(truncate("   ab", 3), "\u2026");
});

// --- Regression tests: input validation ---

test("regression: limit 0 throws TypeError", () => {
  assert.throws(() => truncate("hi", 0), TypeError);
});

test("regression: negative limit throws TypeError", () => {
  assert.throws(() => truncate("hi", -1), TypeError);
});

test("regression: non-integer limit throws TypeError", () => {
  assert.throws(() => truncate("hi", 2.5), TypeError);
});

test("regression: string limit throws TypeError", () => {
  assert.throws(() => truncate("hi", "5"), TypeError);
});

test("regression: NaN, Infinity, null, undefined limit throw TypeError", () => {
  for (const bad of [NaN, Infinity, null, undefined]) {
    assert.throws(() => truncate("hi", bad), TypeError);
  }
});

test("regression: missing limit throws TypeError", () => {
  assert.throws(() => truncate("hi"), TypeError);
});

test("regression: non-string text throws TypeError", () => {
  for (const bad of [null, undefined, 42, {}, ["a"]]) {
    assert.throws(() => truncate(bad, 5), TypeError);
  }
});
