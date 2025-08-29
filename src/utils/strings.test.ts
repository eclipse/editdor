/********************************************************************************
 * Copyright (c) 2025 Contributors to the Eclipse Foundation
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0, or the W3C Software Notice and
 *
 * SPDX-License-Identifier: EPL-2.0 OR W3C-20150513
 ********************************************************************************/
import { test, expect, describe } from "vitest";
import {
  extractIndexFromId,
  isValidUrl,
  formatTextKey,
  formatText,
  capitalizeFirstLetter,
  ensureTrailingSlash,
  stripDoubleQuotes,
} from "./strings";

describe("extractIndexFromId", () => {
  test("should extract index from a properly formatted ID", () => {
    expect(extractIndexFromId("item - 0")).toBe(0);
    expect(extractIndexFromId("item - 42")).toBe(42);
  });
  test("other cases", () => {
    expect(extractIndexFromId("temperature - -5")).toBe(-5);
    expect(extractIndexFromId("property - 1 - extra")).toBe(1);
    expect(extractIndexFromId("item-")).toBe(NaN);
    expect(extractIndexFromId("item")).toBe(NaN);
    expect(Number.isNaN(extractIndexFromId("property - abc"))).toBe(true);
    expect(extractIndexFromId("property -  5 ")).toBe(5);
  });
});

describe("isValidUrl", () => {
  test("should validate URLs correctly", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("http://localhost:3000")).toBe(true);
  });
  test("should invalidate non-HTTP URLs", () => {
    expect(isValidUrl("ftp://example.org")).toBe(false);
    expect(isValidUrl("not-a-url")).toBe(false);
    expect(isValidUrl("")).toBe(false);
  });
});

describe("formatTextKey", () => {
  test("should format text keys correctly", () => {
    expect(formatTextKey("property", 0)).toBe("property");
    expect(formatTextKey("modbus:address", 0)).toBe("modbus:address");
    expect(formatTextKey("", 0)).toBe("");

    expect(formatTextKey("property", 1)).toBe("property (form 2)");
    expect(formatTextKey("modbus:address", 2)).toBe("modbus:address (form 3)");
    expect(formatTextKey("temperature", 9)).toBe("temperature (form 10)");

    expect(formatTextKey("", 1)).toBe(" (form 2)");
    expect(formatTextKey("", 5)).toBe(" (form 6)");

    expect(formatTextKey("key-with-dashes", 1)).toBe(
      "key-with-dashes (form 2)"
    );
    expect(formatTextKey("key_with_underscores", 2)).toBe(
      "key_with_underscores (form 3)"
    );
    expect(formatTextKey("key.with.dots", 3)).toBe("key.with.dots (form 4)");

    expect(formatTextKey("property (special)", 1)).toBe(
      "property (special) (form 2)"
    );
    expect(formatTextKey("(important)", 2)).toBe("(important) (form 3)");

    expect(formatTextKey("property", -1)).toBe("property (form 0)");
    expect(formatTextKey("modbus:address", -5)).toBe(
      "modbus:address (form -4)"
    );
  });
});

describe("formatText", () => {
  test("should format text correctly", () => {
    expect(formatText("modbus:unitID")).toBe("Unit ID");
    expect(formatText("modbus:address")).toBe("Address");
    expect(formatText("modbus:entity")).toBe("Entity");

    expect(formatText("propName")).toBe("Property Name");
    expect(formatText("propNameTest")).toBe("Property Name");

    expect(formatText("href")).toBe("Resource");
    expect(formatText("hrefPath")).toBe("Resource");

    expect(formatText("htv:methodName")).toBe("Method");
    expect(formatText("htv:methodNameTest")).toBe("Method");

    expect(formatText("camelCase")).toBe("Camel Case");
    expect(formatText("multipleWordsInCamelCase")).toBe(
      "Multiple Words In Camel Case"
    );
    expect(formatText("singleWord")).toBe("Single Word");

    expect(formatText("lowercase")).toBe("Lowercase");
    expect(formatText("alreadyCapitalized")).toBe("Already Capitalized");

    expect(formatText("modbus:mostSignificantByte")).toBe(
      "Most Significant Byte"
    );
    expect(formatText("modbus:unitID")).toBe("Unit ID");
    expect(formatText("propNameExample")).toBe("Property Name");
    expect(formatText("hrefUserProfile")).toBe("Resource");

    expect(formatText("")).toBe("");

    expect(formatText("Normal text")).toBe("Normal text");
    expect(formatText("Already Capitalized")).toBe("Already Capitalized");

    expect(formatText("temperature2Reading")).toBe("Temperature2Reading");
    expect(formatText("modbus:register3Value")).toBe("Register3Value");
  });
});

describe("capitalizeFirstLetter", () => {
  test("should capitalize the first letter of a string", () => {
    expect(capitalizeFirstLetter("hello")).toBe("Hello");
    expect(capitalizeFirstLetter("world")).toBe("World");
  });

  test("should handle already capitalized strings", () => {
    expect(capitalizeFirstLetter("already Capitalized")).toBe(
      "Already Capitalized"
    );
  });

  test("should handle empty strings", () => {
    expect(capitalizeFirstLetter("")).toBe("");
  });
});

describe("ensureTrailingSlash", () => {
  test("should add a trailing slash if missing", () => {
    expect(ensureTrailingSlash("https://example.com")).toBe(
      "https://example.com/"
    );
  });

  test("should not add a trailing slash if already present", () => {
    expect(ensureTrailingSlash("https://example.com/")).toBe(
      "https://example.com/"
    );
  });

  test("should handle empty strings", () => {
    expect(ensureTrailingSlash("")).toBe("/");
  });
});

describe("stripDoubleQuotes", () => {
  test("should remove double quotes from around a string", () => {
    expect(stripDoubleQuotes('"hello"')).toBe("hello");
    expect(stripDoubleQuotes("hello")).toBe("hello");
    expect(stripDoubleQuotes('"hello')).toBe("hello");
    expect(stripDoubleQuotes('hello"')).toBe("hello");
    expect(stripDoubleQuotes('""')).toBe("");
  });
  test("should return an empty string for empty input", () => {
    expect(stripDoubleQuotes("")).toBe("");
  });
});
