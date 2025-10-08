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
import { parseCsv, mapRowToProperty, mapCsvToProperties } from "./parser";
import type { CsvData } from "./parser";

describe("parseCsv", () => {
  test("should parse CSV content with headers correctly", () => {
    const csvContent = `name,type,modbus:address,modbus:entity,modbus:unitID,modbus:quantity,modbus:zeroBasedAddressing,modbus:function,modbus:mostSignificantByte,modbus:mostSignificantWord,href
temperature,number,40001,coil,1,2,false,03,true,true,/temperature`;

    const result = parseCsv(csvContent, true, ",");

    expect(result).toEqual([
      {
        name: "temperature",
        type: "number",
        "modbus:address": "40001",
        "modbus:entity": "coil",
        "modbus:unitID": "1",
        "modbus:quantity": "2",
        "modbus:zeroBasedAddressing": "false",
        "modbus:function": "03",
        "modbus:mostSignificantByte": "true",
        "modbus:mostSignificantWord": "true",
        href: "/temperature",
      },
    ]);
  });

  test("should handle empty CSV content", () => {
    expect(() => parseCsv("", true, ",")).toThrow("CSV content is empty");
  });

  test("should throw error when parsing without headers", () => {
    const csvContent = `temperature,number,40001,coil,1,2,false,03,true,true,/temperature`;
    expect(() => parseCsv(csvContent, false, ",")).toThrow(
      "CSV parsing without headers is not supported"
    );
  });

  test("should handle different separator characters", () => {
    const csvContent = `name;type;modbus:address;modbus:entity;modbus:unitID;modbus:quantity;modbus:zeroBasedAddressing;modbus:function;modbus:mostSignificantByte;modbus:mostSignificantWord;href
temperature;number;40001;coil;1;2;false;03;true;true;/temperature`;

    const result = parseCsv(csvContent, true, ";");

    expect(result[0].name).toBe("temperature");
    expect(result[0]["modbus:entity"]).toBe("coil");
  });

  test("should ignore empty rows and trim whitespace", () => {
    const csvContent = `name,type,modbus:address,modbus:entity,modbus:unitID,modbus:quantity,modbus:zeroBasedAddressing,modbus:function,modbus:mostSignificantByte,modbus:mostSignificantWord,href
  temperature,number,40001,coil,1,2,false,03,true,true,/temperature

  humidity,number,40003, holding, 1 , 2 ,false,03,true,true,/humidity
  `;

    const result = parseCsv(csvContent, true, ",");

    expect(result.length).toBe(2);
    expect(result[1].name).toBe("humidity");
    expect(result[1]["modbus:entity"]).toBe("holding");
  });
});

describe("mapRowToProperty", () => {
  test("should correctly convert all fields", () => {
    const row: CsvData = {
      name: "temperature",
      title: "Temperature",
      description: "Room temperature",
      type: "number",
      minimum: "0",
      maximum: "100",
      unit: "celsius",
      href: "/temperature",
      "modbus:unitID": 1,
      "modbus:address": "40001",
      "modbus:quantity": "2",
      "modbus:type": "int16",
      "modbus:zeroBasedAddressing": "true",
      "modbus:entity": "holding",
      "modbus:pollingTime": "1000",
      "modbus:function": "03",
      "modbus:mostSignificantByte": "false",
      "modbus:mostSignificantWord": "true",
      "modbus:timeout": "500",
    };

    const result = mapRowToProperty(row);

    expect(result).toEqual({
      type: "number",
      readOnly: true,
      title: "Temperature",
      description: "Room temperature",
      minimum: 0,
      maximum: 100,
      unit: "celsius",
      forms: [
        {
          op: "readproperty",
          href: "/temperature",
          "modbus:unitID": 1,
          "modbus:address": 40001,
          "modbus:quantity": 2,
          "modbus:type": "int16",
          "modbus:zeroBasedAddressing": true,
          "modbus:entity": "holding",
          "modbus:pollingTime": "1000",
          "modbus:function": "03",
          "modbus:mostSignificantByte": false,
          "modbus:mostSignificantWord": true,
          "modbus:timeout": "500",
        },
      ],
    });
  });

  test("should handle missing optional fields", () => {
    const row: CsvData = {
      name: "temperature",
      type: "number",
      href: "",
      "modbus:unitID": 1,
      "modbus:address": "40001",
      "modbus:quantity": "2",
      "modbus:zeroBasedAddressing": "false",
      "modbus:entity": "holding",
      "modbus:function": "03",
      "modbus:mostSignificantByte": "true",
      "modbus:mostSignificantWord": "true",
    };

    const result = mapRowToProperty(row);

    expect(result.title).toBeUndefined();
    expect(result.description).toBeUndefined();
    expect(result.minimum).toBeUndefined();
    expect(result.maximum).toBeUndefined();
    expect(result.unit).toBeUndefined();
    expect(result.forms[0].href).toBe("/");
    expect(result.forms[0]["modbus:pollingTime"]).toBeUndefined();
    expect(result.forms[0]["modbus:timeout"]).toBeUndefined();
  });

  test("should apply correct boolean conversions", () => {
    const row: CsvData = {
      name: "temperature",
      type: "number",
      href: "/temperature",
      "modbus:unitID": 1,
      "modbus:address": "40001",
      "modbus:quantity": "2",
      "modbus:zeroBasedAddressing": "true",
      "modbus:entity": "holding",
      "modbus:function": "03",
      "modbus:mostSignificantByte": "false",
      "modbus:mostSignificantWord": "false",
    };

    const result = mapRowToProperty(row);

    expect(result.forms[0]["modbus:zeroBasedAddressing"]).toBe(true);
    expect(result.forms[0]["modbus:mostSignificantByte"]).toBe(false);
    expect(result.forms[0]["modbus:mostSignificantWord"]).toBe(false);
  });
});

describe("mapCsvToProperties", () => {
  test("should convert multiple rows correctly", () => {
    const data: CsvData[] = [
      {
        name: "temperature",
        type: "number",
        href: "/temperature",
        "modbus:unitID": 1,
        "modbus:address": "40001",
        "modbus:quantity": "2",
        "modbus:zeroBasedAddressing": "false",
        "modbus:entity": "holding",
        "modbus:function": "03",
        "modbus:mostSignificantByte": "true",
        "modbus:mostSignificantWord": "true",
      },
      {
        name: "humidity",
        type: "number",
        href: "/humidity",
        "modbus:unitID": 1,
        "modbus:address": "40003",
        "modbus:quantity": "2",
        "modbus:zeroBasedAddressing": "false",
        "modbus:entity": "holding",
        "modbus:function": "03",
        "modbus:mostSignificantByte": "true",
        "modbus:mostSignificantWord": "true",
      },
    ];

    const result = mapCsvToProperties(data);

    expect(Object.keys(result)).toEqual(["temperature", "humidity"]);
    expect(result.temperature.forms[0]["modbus:address"]).toBe(40001);
    expect(result.humidity.forms[0]["modbus:address"]).toBe(40003);
  });

  test("should throw error when name is missing", () => {
    const data: CsvData[] = [
      {
        name: "",
        type: "number",
        href: "/temperature",
        "modbus:unitID": 1,
        "modbus:address": "40001",
        "modbus:quantity": "2",
        "modbus:zeroBasedAddressing": "false",
        "modbus:entity": "holding",
        "modbus:function": "03",
        "modbus:mostSignificantByte": "true",
        "modbus:mostSignificantWord": "true",
      },
    ];

    expect(() => mapCsvToProperties(data)).toThrow(
      "Error on CSV file: Row name is required"
    );
  });

  test("should throw error when modbus:address is missing", () => {
    const data: CsvData[] = [
      {
        name: "temperature",
        type: "number",
        href: "/temperature",
        "modbus:unitID": 1,
        "modbus:address": "",
        "modbus:quantity": "2",
        "modbus:zeroBasedAddressing": "false",
        "modbus:entity": "holding",
        "modbus:function": "03",
        "modbus:mostSignificantByte": "true",
        "modbus:mostSignificantWord": "true",
      },
    ];

    expect(() => mapCsvToProperties(data)).toThrow(
      'Error on CSV file: "modbus:address" value is required for row: "temperature"'
    );
  });

  test("should throw error when modbus:entity is missing", () => {
    const data: CsvData[] = [
      {
        name: "temperature",
        type: "number",
        href: "/temperature",
        "modbus:unitID": 1,
        "modbus:address": "40001",
        "modbus:quantity": "2",
        "modbus:zeroBasedAddressing": "false",
        "modbus:entity": "",
        "modbus:function": "03",
        "modbus:mostSignificantByte": "true",
        "modbus:mostSignificantWord": "true",
      },
    ];

    expect(() => mapCsvToProperties(data)).toThrow(
      'Error on CSV file: "modbus:entity" value is required for row: "temperature"'
    );
  });

  test("should handle empty data array", () => {
    expect(mapCsvToProperties([])).toEqual({});
  });

  test("should handle a mix of complete and partial data", () => {
    const data: CsvData[] = [
      {
        name: "temperature",
        title: "Temperature",
        description: "Room temperature",
        type: "number",
        minimum: "0",
        maximum: "100",
        unit: "celsius",
        href: "/temperature",
        "modbus:unitID": 1,
        "modbus:address": "40001",
        "modbus:quantity": "2",
        "modbus:type": "int16",
        "modbus:zeroBasedAddressing": "true",
        "modbus:entity": "holding",
        "modbus:pollingTime": "1000",
        "modbus:function": "03",
        "modbus:mostSignificantByte": "false",
        "modbus:mostSignificantWord": "true",
        "modbus:timeout": "500",
      },
      {
        name: "humidity",
        type: "number",
        href: "/humidity",
        "modbus:unitID": 1,
        "modbus:address": "40003",
        "modbus:quantity": "2",
        "modbus:zeroBasedAddressing": "false",
        "modbus:entity": "holding",
        "modbus:function": "03",
        "modbus:mostSignificantByte": "true",
        "modbus:mostSignificantWord": "true",
      },
    ];

    const result = mapCsvToProperties(data);

    expect(result.temperature.title).toBe("Temperature");
    expect(result.temperature.unit).toBe("celsius");
    expect(result.humidity.title).toBeUndefined();
    expect(result.humidity.unit).toBeUndefined();
  });
});
