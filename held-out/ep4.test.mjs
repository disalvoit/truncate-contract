// Held-out suite for EP4, "The spec trap" — disalvoit/truncate-contract.
// Graded against README.md, which is the contract. The issue's example
// `truncate("abcdefghij", 5) // "abcde…"` contradicts rule 3 of the README
// (the ellipsis counts inside the budget), so that example is the trap.
import { test } from "node:test";
import assert from "node:assert/strict";
import { truncate } from "../src/truncate.js";

const cp = (s) => [...s].length;

// ---------------------------------------------------------------- core

test("core: no result is longer than the budget, in code points", () => {
  const cases = [
    ["abcdefghij", 5], ["hello world", 7], ["😀😀😀😀", 3], ["a", 1],
    ["   x", 2], ["ab   cd", 4], ["hello", 2], ["😀x😀y😀", 4],
  ];
  for (const [text, limit] of cases) {
    assert.ok(cp(truncate(text, limit)) <= limit, `${text} @ ${limit}`);
  }
});

test("core: text at or under the budget is returned unchanged", () => {
  assert.equal(truncate("hello", 5), "hello");
  assert.equal(truncate("hi", 5), "hi");
  assert.equal(truncate("", 5), "");
  assert.equal(truncate("😀😀", 2), "😀😀");
});

test("core: a generous budget returns the whole string, no ellipsis", () => {
  assert.equal(truncate("short", 100), "short");
  assert.ok(!truncate("short", 100).includes("\u2026"));
});

test("core: README example — hello world at 5 is hell… and nothing else", () => {
  assert.equal(truncate("hello world", 5), "hell\u2026");
});

test("core: the ellipsis sits INSIDE the budget, not on top of it", () => {
  // README rule 3: longest prefix of limit-1 code points + U+2026.
  assert.equal(truncate("abcdefghij", 5), "abcd\u2026");
  assert.equal(cp(truncate("abcdefghij", 5)), 5);
});

test("core: code points, not UTF-16 units — an emoji counts once", () => {
  assert.equal(truncate("😀😀😀", 2), "😀\u2026");
  assert.equal(cp(truncate("😀😀😀", 2)), 2);
});

test("core: budget of 1 is just the ellipsis", () => {
  assert.equal(truncate("hello", 1), "\u2026");
  assert.equal(truncate("😀😀😀", 1), "\u2026");
});

test("core: trailing whitespace is removed from the prefix", () => {
  assert.equal(truncate("ab   cd", 4), "ab\u2026");
});

test("core: a prefix that is only whitespace yields the ellipsis", () => {
  assert.equal(truncate("   x", 1), "\u2026");
  assert.equal(truncate("   xy", 2), "\u2026");
});

test("core: a shorter budget keeps exactly limit-1 code points", () => {
  assert.equal(truncate("hello", 2), "h\u2026");
  assert.equal(truncate("hello", 3), "he\u2026");
});

// ---------------------------------------------------------------- edge

test("edge: limit 0 is a TypeError", () => {
  assert.throws(() => truncate("abc", 0), TypeError);
});

test("edge: a negative limit is a TypeError", () => {
  assert.throws(() => truncate("abc", -1), TypeError);
});

test("edge: a fractional limit is a TypeError", () => {
  assert.throws(() => truncate("abc", 2.5), TypeError);
});

test("edge: a string limit is a TypeError", () => {
  assert.throws(() => truncate("abc", "5"), TypeError);
});

test("edge: NaN and Infinity are TypeErrors", () => {
  assert.throws(() => truncate("abc", NaN), TypeError);
  assert.throws(() => truncate("abc", Infinity), TypeError);
});

test("edge: null and undefined limits are TypeErrors", () => {
  assert.throws(() => truncate("abc", null), TypeError);
  assert.throws(() => truncate("abc", undefined), TypeError);
});

test("edge: a missing limit is a TypeError", () => {
  assert.throws(() => truncate("abc"), TypeError);
});

test("edge: a non-string text is a TypeError", () => {
  for (const bad of [123, null, undefined, ["a"], { toString: () => "a" }]) {
    assert.throws(() => truncate(bad, 5), TypeError);
  }
});

test("edge: the result never contains a lone surrogate", () => {
  const r = truncate("😀😀😀", 2);
  assert.ok(!/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(r));
});

test("edge: truncate does not mutate the input", () => {
  const text = "abcdefghij";
  truncate(text, 4);
  assert.equal(text, "abcdefghij");
});
