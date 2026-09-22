import { describe, expect, it } from "vitest";
import {
  buildJwLibraryBibleParam,
  buildJwLibraryUrl,
  parseScriptureReference,
} from "@/lib/bible/jwLibraryLink";

describe("jwLibraryLink", () => {
  it("parses a simple Italian reference", () => {
    const parsed = parseScriptureReference("Matteo 26:41");
    expect(parsed).toMatchObject({ bookNumber: 40, chapter: 26, verseStart: 41, verseEnd: 41 });
    expect(buildJwLibraryBibleParam(parsed!)).toBe("40026041");
  });

  it("parses ranges and comma verses", () => {
    expect(parseScriptureReference("1 Tessalonicesi 4:3-5")).toMatchObject({
      bookNumber: 52,
      chapter: 4,
      verseStart: 3,
      verseEnd: 5,
    });
    expect(parseScriptureReference("Filippesi 4:6, 7")).toMatchObject({
      bookNumber: 50,
      verseStart: 6,
      verseEnd: 7,
    });
  });

  it("builds a JW Library deep link", () => {
    const url = buildJwLibraryUrl("Giobbe 31:1");
    expect(url).toContain("jwlibrary:///finder?");
    expect(url).toContain("bible=18031001");
    expect(url).toContain("wtlocale=I");
  });

  it("parses Romani and multi-word books", () => {
    expect(parseScriptureReference("Romani 12:9")).toMatchObject({ bookNumber: 45, chapter: 12, verseStart: 9 });
    expect(parseScriptureReference("2 Pietro 1:5, 6")).toMatchObject({
      bookNumber: 61,
      chapter: 1,
      verseStart: 5,
      verseEnd: 6,
    });
  });
});
