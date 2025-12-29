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
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isThingModel,
  checkIfFormIsInElement,
  checkIfFormIsInItem,
} from "./tdOperations";
import * as tdOps from "./tdOperations";

describe("isThingModel", () => {
  test("should false for non-object inputs", () => {
    const invalidInputs: any[] = [
      null,
      undefined,
      123,
      "str",
      true,
      [],
      () => {},
    ];
    for (const input of invalidInputs) {
      expect(isThingModel(input)).toBe(false);
    }
  });

  test('should return false when object does not have "@type"', () => {
    expect(isThingModel({})).toBe(false);
    expect(isThingModel({ type: "tm:ThingModel" })).toBe(false);
  });

  test('should return true when "@type" is the string "tm:ThingModel"', () => {
    expect(isThingModel({ "@type": "tm:ThingModel" })).toBe(true);
  });

  test('should return true when "@type" string contains "tm:ThingModel" as substring', () => {
    expect(isThingModel({ "@type": "Some tm:ThingModel value" })).toBe(true);
    expect(isThingModel({ "@type": "prefix tm:ThingModel" })).toBe(true);
    expect(isThingModel({ "@type": "tm:ThingModel suffix" })).toBe(true);
  });

  test('should return true when "@type" is an array containing "tm:ThingModel"', () => {
    expect(isThingModel({ "@type": ["Other", "tm:ThingModel"] })).toBe(true);
    expect(isThingModel({ "@type": ["tm:ThingModel"] })).toBe(true);
  });

  test('should return false when "@type" is a string not containing "tm:ThingModel"', () => {
    expect(isThingModel({ "@type": "ThingDescription" })).toBe(false);
    expect(isThingModel({ "@type": "" })).toBe(false);
  });

  test('should return false when "@type" array does not include "tm:ThingModel"', () => {
    expect(isThingModel({ "@type": ["Other", "TD"] })).toBe(false);
  });

  test("should return false when '@type' is uppercase", () => {
    expect(isThingModel({ "@type": "TM:ThingModel" })).toBe(false);
    expect(isThingModel({ "@type": ["TM:ThingModel"] })).toBe(false);
  });
});

describe("checkIfFormIsInElement", () => {
  // element.op is string: only op is compared (other props are ignored)
  test("returns true when element.op(string) equals form.op(string), ignoring other props", () => {
    const form = { op: "readproperty", href: "/different" } as any;
    const element = {
      op: "readproperty",
      href: "/properties/temperature",
    } as any;

    expect(checkIfFormIsInElement(form, element)).toBe(true);
  });

  test("returns false when element.op(string) differs from form.op(string)", () => {
    const form = { op: "readproperty" } as any;
    const element = { op: "writeproperty" } as any;

    expect(checkIfFormIsInElement(form, element)).toBe(false);
  });

  // element.op is array: op must include form.op AND all other form props must match (shallow)
  test("returns true when element.op(array) includes form.op and other props match", () => {
    const form = {
      op: "readproperty",
      href: "/properties/temperature",
      contentType: "application/json",
    } as any;
    const element = {
      op: ["writeproperty", "readproperty"],
      href: "/properties/temperature",
      contentType: "application/json",
    } as any;

    expect(checkIfFormIsInElement(form, element)).toBe(true);
  });

  test("returns false when element.op(array) includes form.op but another prop differs", () => {
    const form = {
      op: "readproperty",
      href: "/properties/temperature",
      contentType: "application/json",
    } as any;
    const element = {
      op: ["readproperty", "observeproperty"],
      href: "/properties/temperature",
      contentType: "text/plain", // mismatch
    } as any;

    expect(checkIfFormIsInElement(form, element)).toBe(false);
  });

  test("returns false when element.op(array) does not include form.op", () => {
    const form = { op: "readproperty", href: "/properties/temperature" } as any;
    const element = {
      op: ["writeproperty", "observeproperty"],
      href: "/properties/temperature",
    } as any;

    expect(checkIfFormIsInElement(form, element)).toBe(false);
  });

  test("returns false when element.op is undefined", () => {
    const form = { op: "readproperty" } as any;
    const element = { href: "/properties/temperature" } as any; // No op

    expect(checkIfFormIsInElement(form, element)).toBe(false);
  });

  // Case sensitivity
  test("returns false when op differs only by case", () => {
    const form = { op: "ReadProperty" } as any;
    const element = { op: ["readproperty", "writeproperty"] } as any;

    expect(checkIfFormIsInElement(form, element)).toBe(false);
  });

  // Nested objects are compared shallowly (reference equality)
  test("returns false when nested object props are structurally equal but different references", () => {
    const form = {
      op: "readproperty",
      href: "/properties/temperature",
      response: { contentType: "application/json" }, // different reference
    } as any;
    const element = {
      op: ["readproperty"],
      href: "/properties/temperature",
      response: { contentType: "application/json" }, // different reference
    } as any;

    expect(checkIfFormIsInElement(form, element)).toBe(false);
  });

  test("returns true when form has only op and element.op(array) includes it", () => {
    const form = { op: "observeproperty" } as any;
    const element = { op: ["readproperty", "observeproperty"] } as any;

    expect(checkIfFormIsInElement(form, element)).toBe(true);
  });

  // Extra properties in element not present in form do not affect positive match (array branch)
  test("returns true when element has extra props not in form and other props match", () => {
    const form = { op: "readproperty", href: "/p/t" } as any;
    const element = {
      op: ["readproperty"],
      href: "/p/t",
      extra: "ignored",
    } as any;

    expect(checkIfFormIsInElement(form, element)).toBe(true);
  });
});

describe("checkIfFormIsInItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===== form.op is array: element.op is string =====

  test("should return true when form.op is array and element.op (string) matches one operation", () => {
    const form = {
      op: ["readproperty", "writeproperty"],
      href: "/properties/temperature",
    };
    const itemToCheck = {
      forms: [{ op: "readproperty", href: "/properties/temperature" }],
    };

    const result = checkIfFormIsInItem(form, itemToCheck);

    expect(result).toBe(true);
  });

  test("should return true when form.op is array and second operation matches element.op (string)", () => {
    const form = {
      op: ["observeproperty", "writeproperty"],
      href: "/properties/temperature",
    };
    const itemToCheck = {
      forms: [{ op: "writeproperty", href: "/properties/temperature" }],
    };

    const result = checkIfFormIsInItem(form, itemToCheck);

    expect(result).toBe(true);
  });

  test("should return false when form.op is array and element.op (string) matches none", () => {
    const form = {
      op: ["readproperty", "writeproperty"],
      href: "/properties/temperature",
    };
    const itemToCheck = {
      forms: [{ op: "observeproperty", href: "/properties/temperature" }],
    };

    const result = checkIfFormIsInItem(form, itemToCheck);

    expect(result).toBe(false);
  });

  // ===== form.op is array: element.op is array with shallow property comparison =====

  test("should return true when form.op is array, element.op is array with overlap, and all other properties match", () => {
    const form = {
      op: ["readproperty", "writeproperty"],
      href: "/properties/temperature",
      contentType: "application/json",
    };
    const itemToCheck = {
      forms: [
        {
          op: ["writeproperty", "observeproperty"],
          href: "/properties/temperature",
          contentType: "application/json",
        },
      ],
    };

    const result = checkIfFormIsInItem(form, itemToCheck);

    expect(result).toBe(true);
  });

  test("should return false when form.op is array, element.op is array with overlap, but href differs", () => {
    const form = {
      op: ["readproperty", "writeproperty"],
      href: "/properties/temperature",
      contentType: "application/json",
    };
    const itemToCheck = {
      forms: [
        {
          op: ["writeproperty", "observeproperty"],
          href: "/properties/humidity", // Different
          contentType: "application/json",
        },
      ],
    };

    const result = checkIfFormIsInItem(form, itemToCheck);

    expect(result).toBe(false);
  });

  test("should return false when form.op is array, element.op is array with overlap, but contentType differs", () => {
    const form = {
      op: ["readproperty", "writeproperty"],
      href: "/properties/temperature",
      contentType: "application/json",
    };
    const itemToCheck = {
      forms: [
        {
          op: ["writeproperty", "observeproperty"],
          href: "/properties/temperature",
          contentType: "text/plain", // Different
        },
      ],
    };

    const result = checkIfFormIsInItem(form, itemToCheck);

    expect(result).toBe(false);
  });

  test("should return true when form.op is array, element.op is array with overlap, and multiple properties match", () => {
    const form = {
      op: ["readproperty", "writeproperty"],
      href: "/properties/temperature",
      contentType: "application/json",
      security: "basic_sc",
      subprotocol: "longpoll",
    };
    const itemToCheck = {
      forms: [
        {
          op: ["writeproperty", "observeproperty"],
          href: "/properties/temperature",
          contentType: "application/json",
          security: "basic_sc",
          subprotocol: "longpoll",
        },
      ],
    };

    const result = checkIfFormIsInItem(form, itemToCheck);

    expect(result).toBe(true);
  });

  test("should return false when form.op is array, element.op is array with no overlap", () => {
    const form = {
      op: ["readproperty", "writeproperty"],
      href: "/properties/temperature",
    };
    const itemToCheck = {
      forms: [
        {
          op: ["observeproperty", "unobserveproperty"],
          href: "/properties/temperature",
        },
      ],
    };

    const result = checkIfFormIsInItem(form, itemToCheck);

    expect(result).toBe(false);
  });

  // ===== Multiple forms in itemToCheck =====

  test("should return true when matching element is found in second form", () => {
    const form = { op: ["writeproperty"], href: "/properties/temperature" };
    const itemToCheck = {
      forms: [
        { op: "readproperty", href: "/properties/humidity" },
        { op: ["writeproperty"], href: "/properties/temperature" },
      ],
    };

    const result = checkIfFormIsInItem(form, itemToCheck);

    expect(result).toBe(true);
  });

  test("should return true when matching element is found in last form", () => {
    const form = { op: ["observeproperty"], href: "/properties/status" };
    const itemToCheck = {
      forms: [
        { op: "readproperty", href: "/properties/temperature" },
        { op: "writeproperty", href: "/properties/humidity" },
        { op: ["observeproperty"], href: "/properties/status" },
      ],
    };

    const result = checkIfFormIsInItem(form, itemToCheck);

    expect(result).toBe(true);
  });

  test("should return false when no form matches in non-empty forms array", () => {
    const form = { op: ["subscribeevent"], href: "/events/change" };
    const itemToCheck = {
      forms: [
        { op: "readproperty", href: "/properties/temperature" },
        { op: "writeproperty", href: "/properties/humidity" },
      ],
    };

    const result = checkIfFormIsInItem(form, itemToCheck);

    expect(result).toBe(false);
  });

  // ===== Edge cases =====

  test("should return false when itemToCheck has empty forms array", () => {
    const form = { op: "readproperty", href: "/properties/temperature" };
    const itemToCheck = { forms: [] };

    const result = checkIfFormIsInItem(form, itemToCheck);

    expect(result).toBe(false);
  });

  test("should handle case sensitivity and return false when ops differ only in case", () => {
    const form = { op: ["ReadProperty"], href: "/properties/temperature" };
    const itemToCheck = {
      forms: [
        {
          op: ["readproperty", "writeproperty"],
          href: "/properties/temperature",
        },
      ],
    };

    const result = checkIfFormIsInItem(form, itemToCheck);

    expect(result).toBe(false);
  });

  test("should return false when nested object properties differ by reference", () => {
    const form = {
      op: ["readproperty"],
      href: "/properties/temperature",
      response: { contentType: "application/json" }, // Different reference
    };
    const itemToCheck = {
      forms: [
        {
          op: ["readproperty", "observeproperty"],
          href: "/properties/temperature",
          response: { contentType: "application/json" }, // Different reference
        },
      ],
    };

    const result = checkIfFormIsInItem(form, itemToCheck);

    expect(result).toBe(false);
  });

  test("should return true when form.op is array with multiple operations and first one matches element.op (string)", () => {
    const form = {
      op: ["readproperty", "writeproperty", "observeproperty"],
      href: "/properties/temperature",
    };
    const itemToCheck = {
      forms: [{ op: "readproperty", href: "/properties/temperature" }],
    };

    const result = checkIfFormIsInItem(form, itemToCheck);

    expect(result).toBe(true);
  });

  test("should return true when form.op is array and middle operation matches", () => {
    const form = {
      op: ["observeproperty", "writeproperty", "readproperty"],
      href: "/properties/temperature",
    };
    const itemToCheck = {
      forms: [
        {
          op: ["writeproperty", "unobserveproperty"],
          href: "/properties/temperature",
        },
      ],
    };

    const result = checkIfFormIsInItem(form, itemToCheck);

    expect(result).toBe(true);
  });

  // ===== Short-circuit behavior =====

  test("should iterate through all form operations until match when form.op is array", () => {
    const form = {
      op: ["observeproperty", "writeproperty"],
      href: "/properties/temperature",
    };
    const itemToCheck = {
      forms: [{ op: "writeproperty", href: "/properties/temperature" }],
    };

    const result = checkIfFormIsInItem(form, itemToCheck);

    expect(result).toBe(true);
  });
});
