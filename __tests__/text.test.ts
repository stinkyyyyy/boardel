import { countWords, stripEmojis } from "../src/utils/text";

describe("Text Utilities", () => {
  describe("countWords", () => {
    test("returns 0 for empty string", () => {
      expect(countWords("")).toBe(0);
    });

    test("returns 0 for string with only spaces", () => {
      expect(countWords("   ")).toBe(0);
      expect(countWords("\t\n\r")).toBe(0);
    });

    test("counts single word", () => {
      expect(countWords("hello")).toBe(1);
      expect(countWords(" hello ")).toBe(1);
    });

    test("counts multiple words", () => {
      expect(countWords("hello world")).toBe(2);
      expect(countWords("hello   world")).toBe(2);
      expect(countWords("one two three")).toBe(3);
    });

    test("handles newlines and tabs", () => {
      expect(countWords("line1\nline2")).toBe(2);
      expect(countWords("col1\tcol2")).toBe(2);
      expect(countWords("mixed\n\t whitespace")).toBe(2);
    });

    test("handles unicode spaces", () => {
      // Non-breaking space
      expect(countWords("hello\u00A0world")).toBe(2);
      // Ideographic space
      expect(countWords("hello\u3000world")).toBe(2);
      // Zero width space (should NOT be a separator usually, but let's check current split behavior)
      // Actually standard \s regex does NOT match zero width space (\u200B).
      // But it matches BOM (\uFEFF) which is 65279.
      expect(countWords("hello\uFEFFworld")).toBe(2);
    });

    test("matches split behavior for edge cases", () => {
      const cases = [
        "word",
        " word ",
        "word1 word2",
        "   word1   word2   ",
        "word1\nword2",
        "word1\tword2",
        "word1\r\nword2",
        "",
        "   ",
      ];

      for (const text of cases) {
        const expected =
          text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
        expect(countWords(text)).toBe(expected);
      }
    });

    test("performance check (simple)", () => {
      const text = "word ".repeat(10000);
      const start = performance.now();
      countWords(text);
      const end = performance.now();
      expect(end - start).toBeLessThan(50); // Should be extremely fast
    });
  });

  describe("stripEmojis", () => {
    // Basic verification to ensure we didn't break it
    test("removes emojis", () => {
      expect(stripEmojis("Hello 😀 World")).toBe("Hello  World");
    });
  });
});
