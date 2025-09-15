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
  normalizeContext,
  extractPlaceholders,
  filterAffordances,
  processConversionTMtoTD,
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
