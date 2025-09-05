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
import { normalizeContext } from "./operations";
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
