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

// Regression: the ellipsis must count inside the budget, not extend it.
test("result never exceeds the limit (regression)", () => {
  assert.equal(truncate("abcdefghij", 5), "abcd\u2026");
  for (const limit of [1, 2, 3, 5, 8]) {
    assert.ok([...truncate("abcdefghij", limit)].length <= limit);
  }
});

test("budget is measured in code points, so emoji count as one", () => {
  assert.equal(truncate("😀😀😀", 2), "😀\u2026");
  assert.equal([...truncate("😀😀😀", 2)].length, 2);
});

test("trailing whitespace is trimmed before the ellipsis", () => {
  assert.equal(truncate("hello world", 6), "hello\u2026");
  assert.equal(truncate("     hello", 4), "\u2026");
});

test("a limit of 1 yields just the ellipsis when cutting", () => {
  assert.equal(truncate("hello", 1), "\u2026");
});

// Regression: invalid limits are rejected instead of silently answered.
test("invalid limits throw TypeError (regression)", () => {
  for (const limit of [0, -1, 2.5, "5", NaN, Infinity, null, undefined]) {
    assert.throws(() => truncate("hello", limit), TypeError);
  }
  assert.throws(() => truncate("hello"), TypeError);
});

test("non-string text throws TypeError", () => {
  for (const text of [null, undefined, 123, ["a"], { toString: () => "a" }]) {
    assert.throws(() => truncate(text, 5), TypeError);
  }
});
