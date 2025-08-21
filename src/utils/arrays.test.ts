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
import { test, expect } from "vitest";
import { removeKeyFromObjects } from "./arrays";

test("should remove the specified key from all objects in the array", () => {
  const inputArray = [
    { id: 1, name: "Item 1", value: 100 },
    { id: 2, name: "Item 2", value: 200 },
    { id: 3, name: "Item 3", value: 300 },
  ];
  const keyToRemove = "value";

  const result = removeKeyFromObjects(inputArray, keyToRemove);

  expect(result).toEqual([
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" },
    { id: 3, name: "Item 3" },
  ]);
  expect(inputArray[0]).toHaveProperty("value");
});

test("should handle objects without the specified key", () => {
  const inputArray = [
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2", value: 200 },
    { id: 3, name: "Item 3" },
  ];
  const keyToRemove = "value";

  const result = removeKeyFromObjects(inputArray, keyToRemove);

  expect(result).toEqual([
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" },
    { id: 3, name: "Item 3" },
  ]);
});

test("should return an empty array when input is empty", () => {
  const inputArray: any[] = [];
  const keyToRemove = "value";

  const result = removeKeyFromObjects(inputArray, keyToRemove);

  expect(result).toEqual([]);
});

test("should handle nested objects properly", () => {
  const inputArray = [
    {
      id: 1,
      metadata: { created: "2023-01-01", value: 100 },
    },
    {
      id: 2,
      metadata: { created: "2023-01-02", value: 200 },
    },
  ];
  const keyToRemove = "metadata";

  const result = removeKeyFromObjects(inputArray, keyToRemove);

  expect(result).toEqual([{ id: 1 }, { id: 2 }]);
});

test("should preserve object references for untouched properties", () => {
  const nestedObj = { data: [1, 2, 3] };
  const inputArray = [
    { id: 1, value: 100, nested: nestedObj },
    { id: 2, value: 200, nested: nestedObj },
  ];
  const keyToRemove = "value";

  const result = removeKeyFromObjects(inputArray, keyToRemove);

  expect(result[0].nested).toBe(result[1].nested);
  expect(result[0].nested).toBe(nestedObj);
});
