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
import { test, expect, describe, it } from "vitest";
import {
  normalizeContext,
  extractPlaceholders,
  filterAffordances,
  processConversionTMtoTD,
  replacePlaceholders,
  replaceStringOnTopLevelKey,
  generateIdForThingDescription,
  prepareTdForSubmission,
} from "./operations";
import { ThingContext } from "wot-thing-description-types";

describe("normalizeContext", () => {
  test("should return array with schema when context is a valid TD context string", () => {
    const context: ThingContext = "https://www.w3.org/2022/wot/td/v1.1";
    const result = normalizeContext(context);
    expect(result).toEqual([
      "https://www.w3.org/2022/wot/td/v1.1",
      { schema: "https://schema.org/" },
    ]);
  });

  test("should throw error when context is an invalid string", () => {
    const context = "invalid-context";
    expect(() => normalizeContext(context as any)).toThrow(
      "validation schema is wrong"
    );
  });

  test("should return context as is when it is an object", () => {
    // @ts-expect-error - Testing with invalid context object format
    const context: ThingContext = { custom: "context" };
    const result = normalizeContext(context);
    expect(result).toEqual({ custom: "context" });
  });

  test("should return array with schema when context is an array with valid TD context string", () => {
    const context: ThingContext = [
      "https://www.w3.org/2022/wot/td/v1.1",
      { custom: "context" },
    ];
    const result = normalizeContext(context);

    expect(result).toEqual([
      "https://www.w3.org/2022/wot/td/v1.1",
      { custom: "context", schema: "https://schema.org/" },
    ]);
  });

  test("should return context as is when context is an array without valid TD context string", () => {
    // @ts-expect-error - Testing with invalid context object format
    const context: ThingContext = [{ custom: "context" }];
    const result = normalizeContext(context);
    expect(result).toEqual([{ custom: "context" }]);
  });

  test("should return context as is when context is an empty array", () => {
    const context: ThingContext = [];
    const result = normalizeContext(context);
    expect(result).toEqual([]);
  });
});

describe("extractPlaceholders", () => {
  test("returns empty array when no placeholders are present", () => {
    expect(extractPlaceholders("This is a test string.")).toEqual([]);
  });

  test("extracts a single placeholder", () => {
    expect(extractPlaceholders("Hello {{name}}!")).toEqual(["name"]);
  });

  test("extracts multiple unique placeholders", () => {
    expect(extractPlaceholders("{{foo}} and {{bar}} and {{baz}}")).toEqual([
      "foo",
      "bar",
      "baz",
    ]);
  });

  test("removes duplicate placeholders", () => {
    expect(extractPlaceholders("{{foo}} and {{foo}}")).toEqual(["foo"]);
  });

  test("handles placeholders with spaces", () => {
    expect(extractPlaceholders("{{ first }} and {{second}}")).toEqual([
      " first ",
      "second",
    ]);
  });

  test("handles adjacent placeholders", () => {
    expect(extractPlaceholders("{{foo}}{{bar}}")).toEqual(["foo", "bar"]);
  });

  test.skip("handles nested curly braces (should not nest)", () => {
    expect(extractPlaceholders("{{foo{{bar}}baz}}")).toEqual(["foo{{bar"]);
  });

  test.skip("handles incomplete placeholders (no closing braces)", () => {
    expect(extractPlaceholders("Hello {{name!")).toEqual([]);
  });

  test("handles incomplete placeholders (no opening braces)", () => {
    expect(extractPlaceholders("Hello name}}!")).toEqual([]);
  });

  test("handles empty placeholder", () => {
    expect(extractPlaceholders("Hello {{}}!")).toEqual([""]);
  });

  test("handles multiple empty placeholders", () => {
    expect(extractPlaceholders("{{}} {{}}")).toEqual([""]);
  });

  test("handles placeholder at the start and end", () => {
    expect(extractPlaceholders("{{start}} middle {{end}}")).toEqual([
      "start",
      "end",
    ]);
  });
});

describe("filterAffordances", () => {
  const exampleAffordances = {
    IDENT_IM0_MANUFACTURER_ID: {
      forms: [
        {
          op: ["readproperty"],
          href: "/",
          "modbus:unitID": 12,
          "modbus:quantity": 1,
          "modbus:address": 2,
          "modbus:type": "integer",
          "modbus:entity": "HoldingRegister",
          "modbus:zeroBasedAddressing": false,
        },
      ],
      "cpcom:id": 2,
      title: "Manufacturer ID",
      titles: {
        "en-US": "Manufacturer ID",
        "de-DE": "Hersteller ID",
        fr: "ID fabricant",
      },
      observable: false,
      readOnly: true,
      writeOnly: false,
      type: "integer",
      default: 42,
    },
    IDENT_IM0_ORDER_ID: {
      forms: [
        {
          op: ["readproperty"],
          href: "/",
          "modbus:unitID": 12,
          "modbus:quantity": 10,
          "modbus:address": 3,
          "modbus:type": "string",
          "modbus:entity": "HoldingRegister",
          "modbus:zeroBasedAddressing": false,
        },
      ],
      "cpcom:id": 3,
      title: "Order Number",
      titles: {
        "en-US": "Order Number",
        "de-DE": "Bestellnummer",
        fr: "Numéro de référence",
      },
      observable: false,
      readOnly: true,
      writeOnly: false,
      type: "string",
    },
    IDENT_IM0_SERIAL_NUMBER: {
      forms: [
        {
          op: ["readproperty"],
          href: "/",
          "modbus:unitID": 12,
          "modbus:quantity": 8,
          "modbus:address": 13,
          "modbus:type": "string",
          "modbus:entity": "HoldingRegister",
          "modbus:zeroBasedAddressing": false,
        },
      ],
      "cpcom:id": 4,
      title: "Serial Number",
      titles: {
        "en-US": "Serial Number",
        "de-DE": "Seriennummer",
        fr: "Numéro de série",
      },
      observable: false,
      readOnly: true,
      writeOnly: false,
      type: "string",
    },
    IDENT_IM0_HARDWARE_REVISION: {
      forms: [
        {
          op: ["readproperty"],
          href: "/",
          "modbus:unitID": 12,
          "modbus:quantity": 1,
          "modbus:address": 21,
          "modbus:type": "integer",
          "modbus:entity": "HoldingRegister",
          "modbus:zeroBasedAddressing": false,
        },
      ],
      "cpcom:id": 5,
      title: "Hardware Revision",
      titles: {
        "en-US": "Hardware Revision",
        "de-DE": "Hardware Version",
        fr: "Révision du matériel",
      },
      observable: false,
      readOnly: true,
      writeOnly: false,
      type: "integer",
      default: 0,
    },
  };

  test("returns only the allowed affordances", () => {
    const allowed = ["IDENT_IM0_ORDER_ID", "IDENT_IM0_SERIAL_NUMBER"];
    const result = filterAffordances(exampleAffordances, allowed);
    expect(Object.keys(result)).toEqual(allowed);
    expect(result.IDENT_IM0_ORDER_ID).toEqual(
      exampleAffordances.IDENT_IM0_ORDER_ID
    );
    expect(result.IDENT_IM0_SERIAL_NUMBER).toEqual(
      exampleAffordances.IDENT_IM0_SERIAL_NUMBER
    );
  });

  test("returns an empty object if no keys are allowed", () => {
    const allowed: string[] = [];
    const result = filterAffordances(exampleAffordances, allowed);
    expect(result).toEqual({});
  });

  test("returns all affordances if all keys are allowed", () => {
    const allowed = Object.keys(exampleAffordances);
    const result = filterAffordances(exampleAffordances, allowed);
    expect(result).toEqual(exampleAffordances);
  });

  test("ignores allowed keys that do not exist in the object", () => {
    const allowed = ["IDENT_IM0_ORDER_ID", "NON_EXISTENT_KEY"];
    const result = filterAffordances(exampleAffordances, allowed);
    expect(Object.keys(result)).toEqual(["IDENT_IM0_ORDER_ID"]);
    expect(result.IDENT_IM0_ORDER_ID).toEqual(
      exampleAffordances.IDENT_IM0_ORDER_ID
    );
    expect(result).not.toHaveProperty("NON_EXISTENT_KEY");
  });

  test("returns an empty object if input object is empty", () => {
    const allowed = ["IDENT_IM0_ORDER_ID"];
    const result = filterAffordances({}, allowed);
    expect(result).toEqual({});
  });
});

describe("processConversionTMtoTD", () => {
  test("correctly replaces string placeholders", () => {
    const tmContent = `{
      "title": "{{title}}",
      "description": "{{description}}",
      "properties": { "prop1": { "type": "string" } }
    }`;

    const result = processConversionTMtoTD(
      tmContent,
      { title: "Test Thing", description: "A test thing" },
      ["prop1"],
      [],
      []
    );

    expect(result.title).toBe("Test Thing");
    expect(result.description).toBe("A test thing");
  });

  test("correctly replaces numeric placeholders", () => {
    const tmContent = `{
      "id": "urn:test:{{id}}",
      "version": {{version}},
      "properties": { "temp": { "type": "number", "minimum": {{min}} } }
    }`;

    const result = processConversionTMtoTD(
      tmContent,
      { id: "123", version: "1", min: "0" },
      ["temp"],
      [],
      []
    );

    expect(result.id).toBe("urn:test:123");
    expect(result.version).toBe(1); // Number, not string
    expect(result.properties.temp.minimum).toBe(0); // Number, not string
  });

  test("correctly filters properties", () => {
    const tmContent = `{
      "properties": {
        "prop1": { "type": "string" },
        "prop2": { "type": "number" },
        "prop3": { "type": "boolean" }
      }
    }`;

    const result = processConversionTMtoTD(
      tmContent,
      {},
      ["prop1", "prop3"],
      [],
      []
    );

    expect(Object.keys(result.properties)).toHaveLength(2);
    expect(result.properties).toHaveProperty("prop1");
    expect(result.properties).toHaveProperty("prop3");
    expect(result.properties).not.toHaveProperty("prop2");
  });

  test("correctly filters actions", () => {
    const tmContent = `{
      "actions": {
        "action1": {},
        "action2": {},
        "action3": {}
      }
    }`;

    const result = processConversionTMtoTD(tmContent, {}, [], ["action2"], []);

    expect(Object.keys(result.actions)).toHaveLength(1);
    expect(result.actions).toHaveProperty("action2");
    expect(result.actions).not.toHaveProperty("action1");
    expect(result.actions).not.toHaveProperty("action3");
  });

  test("correctly filters events", () => {
    const tmContent = `{
      "events": {
        "event1": {},
        "event2": {},
        "event3": {}
      }
    }`;

    const result = processConversionTMtoTD(
      tmContent,
      {},
      [],
      [],
      ["event1", "event3"]
    );

    expect(Object.keys(result.events)).toHaveLength(2);
    expect(result.events).toHaveProperty("event1");
    expect(result.events).toHaveProperty("event3");
    expect(result.events).not.toHaveProperty("event2");
  });

  test("removes TM-specific fields", () => {
    const tmContent = `{
      "@type": "tm:ThingModel",
      "tm:required": ["#properties/prop1"],
      "properties": { "prop1": {} }
    }`;

    const result = processConversionTMtoTD(tmContent, {}, ["prop1"], [], []);

    expect(result).not.toHaveProperty("@type");
    expect(result).not.toHaveProperty("tm:required");
  });
  test("handles complex TM to TD conversion", () => {
    const tmContent = `{
      "@type": "tm:ThingModel",
      "title": "{{modelName}}",
      "version": {{version}},
      "tm:required": ["#properties/required1"],
      "properties": {
        "required1": { "type": "string" },
        "optional1": { "type": "number" },
        "optional2": { "type": "boolean" }
      },
      "actions": {
        "action1": {},
        "action2": {}
      },
      "events": {
        "event1": {},
        "event2": {}
      }
    }`;

    const result = processConversionTMtoTD(
      tmContent,
      { modelName: "Test Model", version: "2.1" },
      ["required1", "optional2"],
      ["action1"],
      ["event2"]
    );

    // Check basic properties
    expect(result.title).toBe("Test Model");
    expect(result.version).toBe(2.1);

    // Check TM fields removed
    expect(result).not.toHaveProperty("@type");
    expect(result).not.toHaveProperty("tm:required");

    // Check filtered properties
    expect(Object.keys(result.properties)).toHaveLength(2);
    expect(result.properties).toHaveProperty("required1");
    expect(result.properties).toHaveProperty("optional2");
    expect(result.properties).not.toHaveProperty("optional1");

    // Check filtered actions
    expect(Object.keys(result.actions)).toHaveLength(1);
    expect(result.actions).toHaveProperty("action1");
    expect(result.actions).not.toHaveProperty("action2");

    // Check filtered events
    expect(Object.keys(result.events)).toHaveLength(1);
    expect(result.events).toHaveProperty("event2");
    expect(result.events).not.toHaveProperty("event1");
  });
});
describe("replacePlaceholders", () => {
  it("replaces multiple string placeholders", () => {
    const content = "Hello {{name}}, your age is {{age}} years!";
    const placeholderValues = { name: "John", age: "30" };
    const result = replacePlaceholders(content, placeholderValues);
    expect(result).toBe("Hello John, your age is 30 years!");
  });

  it("replaces a single numeric placeholder (both quoted and unquoted)", () => {
    const content = 'The value is {{value}} and "{{value}}"';
    const placeholderValues = { value: "42" };
    const result = replacePlaceholders(content, placeholderValues);
    expect(result).toBe("The value is 42 and 42");
  });

  it("replaces multiple numeric placeholders", () => {
    const content = "x = {{x}}, y = {{y}}, z = {{z}}";
    const placeholderValues = { x: "1", y: "2", z: "3" };
    const result = replacePlaceholders(content, placeholderValues);
    expect(result).toBe("x = 1, y = 2, z = 3");
  });

  it("replaces a mix of string and numeric placeholders", () => {
    const content = "Hello {{name}}, your score is {{score}}!";
    const placeholderValues = { name: "Alice", score: "95" };
    const result = replacePlaceholders(content, placeholderValues);
    expect(result).toBe("Hello Alice, your score is 95!");
  });

  it("handles empty content string", () => {
    const content = "";
    const placeholderValues = { name: "World" };
    const result = replacePlaceholders(content, placeholderValues);
    expect(result).toBe("");
  });

  it("handles empty placeholderValues object", () => {
    const content = "Hello {{name}}!";
    const placeholderValues = {};
    const result = replacePlaceholders(content, placeholderValues);
    expect(result).toBe("Hello {{name}}!");
  });

  it("ignores placeholders not found in placeholderValues", () => {
    const content = "Hello {{name}}, your age is {{age}}!";
    const placeholderValues = { name: "John" };
    const result = replacePlaceholders(content, placeholderValues);
    expect(result).toBe("Hello John, your age is {{age}}!");
  });

  it("replaces placeholders with empty values", () => {
    const content = "Hello {{name}}!";
    const placeholderValues = { name: "" };
    const result = replacePlaceholders(content, placeholderValues);
    expect(result).toBe("Hello !");
  });

  it("handles adjacent placeholders", () => {
    const content = "Hello {{firstName}}{{lastName}}!";
    const placeholderValues = { firstName: "John", lastName: "Doe" };
    const result = replacePlaceholders(content, placeholderValues);
    expect(result).toBe("Hello JohnDoe!");
  });

  it("handles IP addresses correctly as strings", () => {
    const content = "Server IP: {{ip}}";
    const placeholderValues = { ip: "192.168.1.1" };
    const result = replacePlaceholders(content, placeholderValues);
    expect(result).toBe("Server IP: 192.168.1.1");
  });

  it("handles placeholders within JSON-like structures", () => {
    const content = '{"name": "{{name}}", "age": {{age}}}';
    const placeholderValues = { name: "John", age: "30" };
    const result = replacePlaceholders(content, placeholderValues);
    expect(result).toBe('{"name": "John", "age": 30}');
  });

  it("handles multiple instances of the same placeholder", () => {
    const content = "{{value}} + {{value}} = {{sum}}";
    const placeholderValues = { value: "5", sum: "10" };
    const result = replacePlaceholders(content, placeholderValues);
    expect(result).toBe("5 + 5 = 10");
  });

  it("handles zero as a numeric value", () => {
    const content = "The value is {{value}}";
    const placeholderValues = { value: "0" };
    const result = replacePlaceholders(content, placeholderValues);
    expect(result).toBe("The value is 0");
  });

  it("handles negative numbers", () => {
    const content = "The value is {{value}}";
    const placeholderValues = { value: "-42" };
    const result = replacePlaceholders(content, placeholderValues);
    expect(result).toBe("The value is -42");
  });

  it("handles decimal numbers", () => {
    const content = "The value is {{value}}";
    const placeholderValues = { value: "3.14159" };
    const result = replacePlaceholders(content, placeholderValues);
    expect(result).toBe("The value is 3.14159");
  });

  it("treats non-numeric strings as strings", () => {
    const content = 'The ID is "{{id}}" and {{id}}';
    const placeholderValues = { id: "ABC123" };
    const result = replacePlaceholders(content, placeholderValues);
    expect(result).toBe('The ID is "ABC123" and ABC123');
  });

  it("preserves formatting for non-replaced placeholders", () => {
    const content = "Hello {{name}}, welcome to {{company}}!";
    const placeholderValues = { name: "John" };
    const result = replacePlaceholders(content, placeholderValues);
    expect(result).toBe("Hello John, welcome to {{company}}!");
  });

  it("handles special characters in placeholder names", () => {
    const content = "Hello {{user-name}} with ID {{user.id}}!";
    const placeholderValues = { "user-name": "John", "user.id": "U12345" };
    const result = replacePlaceholders(content, placeholderValues);
    expect(result).toBe("Hello John with ID U12345!");
  });

  it("correctly handles quoted placeholders for strings", () => {
    const content =
      'Config: {"stringKey": "{{stringValue}}", "numKey": {{numValue}}}';
    const placeholderValues = { stringValue: "hello", numValue: "42" };
    const result = replacePlaceholders(content, placeholderValues);
    expect(result).toBe('Config: {"stringKey": "hello", "numKey": 42}');
  });
});
describe("replaceStringOnTopLevelKey", () => {
  it("replaces string in top-level key", () => {
    const input = {
      title: "My Device",
      base: "modbus://device/",
      properties: {
        temp: {
          base: "modbus://device/temp",
        },
      },
    };

    const { modifiedStructure, summary } = replaceStringOnTopLevelKey(
      input as any,
      "base",
      "modbus://",
      "http://"
    );

    expect(modifiedStructure.base).toBe("http://device/");
    // @ts-ignore
    expect(modifiedStructure.properties.temp.base).toBe("modbus://device/temp"); // Not changed
    expect(summary.replacementMade).toBe(true);
    expect(summary.keyFound).toBe(true);
  });

  it("doesn't modify nested properties with the same key", () => {
    const input = {
      title: "My Device",
      href: "modbus://device/1",
      properties: {
        temp: {
          href: "modbus://device/temp",
        },
      },
    };

    const { modifiedStructure } = replaceStringOnTopLevelKey(
      input as any,
      "href",
      "modbus://",
      "http://"
    );

    expect(modifiedStructure.href).toBe("http://device/1");
    // @ts-ignore
    expect(modifiedStructure.properties.temp.href).toBe("modbus://device/temp");
  });

  it("returns correct summary when no replacement is made", () => {
    const input = {
      title: "My Device",
      base: "http://device/",
    };

    const { modifiedStructure, summary } = replaceStringOnTopLevelKey(
      input as any,
      "base",
      "modbus://",
      "http://"
    );

    expect(modifiedStructure.base).toBe("http://device/");
    expect(summary.replacementMade).toBe(false);
    expect(summary.keyFound).toBe(true);
  });

  it("returns correct summary when key is not found", () => {
    const input = {
      title: "My Device",
    };

    const { modifiedStructure, summary } = replaceStringOnTopLevelKey(
      input as any,
      "base",
      "modbus://",
      "http://"
    );

    expect(modifiedStructure).toEqual(input);
    expect(summary.replacementMade).toBe(false);
    expect(summary.keyFound).toBe(false);
  });

  it("handles multiple replacements in the same string", () => {
    const input = {
      title: "My Device",
      description: "modbus://device/1 and modbus://device/2",
    };

    const { modifiedStructure } = replaceStringOnTopLevelKey(
      input as any,
      "description",
      "modbus://",
      "http://"
    );

    expect(modifiedStructure.description).toBe(
      "http://device/1 and http://device/2"
    );
  });

  it("doesn't modify non-string properties", () => {
    const input = {
      title: "My Device",
      numericProp: 42,
      booleanProp: true,
      objectProp: { test: "value" },
    };

    const { modifiedStructure: result1, summary: summary1 } =
      replaceStringOnTopLevelKey(input as any, "numericProp", "42", "100");

    const { modifiedStructure: result2, summary: summary2 } =
      replaceStringOnTopLevelKey(input as any, "booleanProp", "true", "false");

    const { modifiedStructure: result3, summary: summary3 } =
      replaceStringOnTopLevelKey(
        input as any,
        "objectProp",
        "value",
        "newValue"
      );

    expect(result1.numericProp).toBe(42);
    expect(result2.booleanProp).toBe(true);
    expect(result3.objectProp).toEqual({ test: "value" });

    expect(summary1.keyFound).toBe(false);
    expect(summary1.replacementMade).toBe(false);

    expect(summary2.keyFound).toBe(false);
    expect(summary2.replacementMade).toBe(false);

    expect(summary3.keyFound).toBe(false);
    expect(summary3.replacementMade).toBe(false);
  });

  it("throws error for invalid structure", () => {
    expect(() =>
      replaceStringOnTopLevelKey(null as any, "base", "modbus://", "http://")
    ).toThrow("Invalid structure");
  });

  it("throws error for invalid target key", () => {
    expect(() =>
      replaceStringOnTopLevelKey(
        { title: "Test" } as any,
        "",
        "modbus://",
        "http://"
      )
    ).toThrow("Target key must be a non-empty string");
  });

  it("handles empty search string", () => {
    const input = {
      base: "",
    };

    const { modifiedStructure } = replaceStringOnTopLevelKey(
      input as any,
      "base",
      "",
      "http://"
    );

    expect(modifiedStructure.base).toBe("http://");
  });

  it("handles empty replace string", () => {
    const input = {
      base: "modbus://device/",
    };

    const { modifiedStructure } = replaceStringOnTopLevelKey(
      input as any,
      "base",
      "modbus://",
      ""
    );

    expect(modifiedStructure.base).toBe("device/");
  });

  it("does not modify the original object", () => {
    const original = {
      base: "modbus://device/",
    };

    const originalCopy = { ...original };

    replaceStringOnTopLevelKey(original as any, "base", "modbus://", "http://");

    expect(original).toEqual(originalCopy);
  });
});

describe("generateIdForThingDescription", () => {
  const urnV4Regex =
    /^urn:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  test("assigns an id when none is present and does not mutate original", async () => {
    const original: any = { title: "Test Thing", properties: {} };
    const originalClone = JSON.parse(JSON.stringify(original));

    const result = generateIdForThingDescription(original);

    expect(result.id).toBeDefined();
    expect(result.id).toMatch(urnV4Regex);
    expect(original).toEqual(originalClone); // original untouched
    expect("id" in original).toBe(false);
  });

  test("produces id in expected urn:uuid (v4) format", async () => {
    const result = generateIdForThingDescription({ title: "X" } as any);
    expect(result.id).toMatch(urnV4Regex);
  });

  test("preserves other fields unchanged", async () => {
    const td: any = {
      title: "Device A",
      description: "Example",
      properties: { temp: { type: "number" } },
      security: ["nosec_sc"],
      securityDefinitions: { nosec_sc: { scheme: "nosec" } },
    };
    const result = generateIdForThingDescription(td);
    const { id, ...rest } = result;
    expect(id).toMatch(urnV4Regex);
    expect(rest).toEqual(td);
  });

  test("does not mutate original when overriding an existing id", async () => {
    const original: any = { id: "urn:should-not-change", title: "Existing" };
    const originalSnapshot = JSON.parse(JSON.stringify(original));

    const result = generateIdForThingDescription(original);

    expect(result.id).toMatch(urnV4Regex);
    expect(result.id).not.toBe(original.id);
    expect(original).toEqual(originalSnapshot); // original still has old id
  });

  test("new id differs across sequential calls on same base object", async () => {
    const base: any = { title: "Same Base" };
    const first = generateIdForThingDescription(base).id;
    const second = generateIdForThingDescription(base).id;
    expect(first).not.toBe(second);
    expect(first).toMatch(urnV4Regex);
    expect(second).toMatch(urnV4Regex);
    // base still unmodified
    expect("id" in base).toBe(false);
  });
});

describe("prepareTdForSubmission", () => {
  test("correctly processes TD with placeholders", () => {
    const td = {
      "@type": "tm:ThingModel",
      "tm:required": ["prop1"],
      title: "{{title}}",
      description: "A {{type}} device",
      properties: {
        prop1: { type: "string" },
      },
    };

    const placeholderValues = {
      title: "Test Thing",
      type: "temperature",
    };

    const result = prepareTdForSubmission(td as any, placeholderValues);

    // Check placeholders are replaced
    expect(result.title).toBe("Test Thing");
    expect(result.description).toBe("A temperature device");

    // Check TD fields are removed
    expect(result).not.toHaveProperty("@type");
    expect(result).not.toHaveProperty("tm:required");

    // Check ID is generated
    expect(result.id).toBeDefined();
    expect(result.id).toMatch(/^urn:/);

    // Check other properties are preserved
    expect(result.properties).toEqual({ prop1: { type: "string" } });
  });

  test("processes TD without placeholders", () => {
    const td = {
      "@type": "tm:ThingModel",
      "tm:required": ["prop1"],
      title: "Static Title",
      description: "A static description",
      properties: {
        prop1: { type: "string" },
      },
    };

    const result = prepareTdForSubmission(td as any, {});

    // Check content is unchanged
    expect(result.title).toBe("Static Title");
    expect(result.description).toBe("A static description");

    // Check TD fields are removed
    expect(result).not.toHaveProperty("@type");
    expect(result).not.toHaveProperty("tm:required");

    // Check ID is generated
    expect(result.id).toBeDefined();
  });

  test("removes TD-specific fields", () => {
    const td = {
      "@type": "tm:ThingModel",
      "tm:required": ["prop1", "prop2"],
      "tm:optional": true,
      title: "Test Thing",
    };

    const result = prepareTdForSubmission(td as any, {});

    expect(result).not.toHaveProperty("@type");
    expect(result).not.toHaveProperty("tm:required");
    // Only @type and tm:required should be removed
    expect(result).toHaveProperty("tm:optional", true);
  });

  test("replaces both string and numeric placeholders", () => {
    const td = {
      title: "Device {{id}}",
      version: "{{version}}",
      maxTemp: "{{maxTemp}}",
    };

    const placeholderValues = {
      id: "ABC123",
      version: "2",
      maxTemp: "100.5",
    };

    const result = prepareTdForSubmission(td as any, placeholderValues);

    expect(result.title).toBe("Device ABC123");
    expect(result.version).toBe(2); // Number not string
    expect(result.maxTemp).toBe(100.5); // Number not string
  });

  test("preserves existing TD structure", () => {
    const td = {
      "@type": "tm:ThingModel",
      title: "{{title}}",
      properties: {
        temp: {
          type: "number",
          unit: "celsius",
          minimum: "{{min}}",
          maximum: "{{max}}",
        },
      },
      actions: {
        reset: {},
      },
      events: {
        overheat: {},
      },
    };

    const placeholderValues = {
      title: "Thermostat",
      min: "-20",
      max: "80",
    };

    const result = prepareTdForSubmission(td as any, placeholderValues);

    expect(result.title).toBe("Thermostat");
    // @ts-ignore
    expect(result.properties.temp.minimum).toBe(-20);
    // @ts-ignore
    expect(result.properties.temp.maximum).toBe(80);
    // @ts-ignore
    expect(result.properties.temp.unit).toBe("celsius");
    expect(result.actions).toHaveProperty("reset");
    expect(result.events).toHaveProperty("overheat");
  });

  test("generates a unique ID even when TD already has an ID", () => {
    const td = {
      id: "urn:existing:id",
      title: "Thing with ID",
    };

    const result = prepareTdForSubmission(td as any, {});

    expect(result.id).not.toBe("urn:existing:id");
    expect(result.id).toMatch(/^urn:/);
  });

  test("handles empty TD gracefully", () => {
    const td = {};

    const result = prepareTdForSubmission(td as any, {});

    expect(result).toHaveProperty("id");
    expect(Object.keys(result).length).toBe(1);
  });

  test("throws error with helpful message when processing fails", () => {
    const invalidTd = null as any;

    expect(() => prepareTdForSubmission(invalidTd, {})).toThrow(
      /Error preparing TD for submission/
    );
  });

  test("does not modify the original TD object", () => {
    const original = {
      "@type": "tm:ThingModel",
      "tm:required": ["prop1"],
      title: "Original Title",
    };

    const originalCopy = JSON.parse(JSON.stringify(original));

    prepareTdForSubmission(original as any, {});

    expect(original).toEqual(originalCopy);
  });

  test("handles nested structures correctly", () => {
    const td = {
      "@type": "tm:ThingModel",
      title: "{{title}}",
      nested: {
        level1: {
          level2: {
            value: "{{nestedValue}}",
          },
        },
      },
    };

    const placeholderValues = {
      title: "Test Thing",
      nestedValue: "Deep Value",
    };

    const result = prepareTdForSubmission(td as any, placeholderValues);

    expect(result.title).toBe("Test Thing");
    // @ts-ignore
    expect(result.nested.level1.level2.value).toBe("Deep Value");
  });

  test("handles arrays correctly", () => {
    const td = {
      "@type": "tm:ThingModel",
      title: "{{title}}",
      items: ["{{item1}}", "{{item2}}", "static"],
    };

    const placeholderValues = {
      title: "Test Thing",
      item1: "Dynamic 1",
      item2: "Dynamic 2",
    };

    const result = prepareTdForSubmission(td as any, placeholderValues);

    expect(result.title).toBe("Test Thing");
    expect(result.items).toEqual(["Dynamic 1", "Dynamic 2", "static"]);
  });
});
