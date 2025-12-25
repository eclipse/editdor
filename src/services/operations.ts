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
import type {
  ThingContext,
  ThingDescription,
} from "wot-thing-description-types";
import { v4 as uuidv4 } from "uuid";
import { generateCurrentTimestampISO } from "../utils/strings";

export function normalizeContext(context: ThingContext): any {
  const TD_CONTEXTS = [
    "https://www.w3.org/2022/wot/td/v1.1",
    "https://www.w3.org/2019/wot/td/v1",
  ];
  const SCHEMA_URL = "https://schema.org/";

  if (typeof context === "string") {
    if (TD_CONTEXTS.includes(context)) {
      return [context, { schema: SCHEMA_URL }];
    }
    throw new Error("validation schema is wrong");
  }
  if (Array.isArray(context)) {
    const tdContexts = context.filter(
      (item) => typeof item === "string" && TD_CONTEXTS.includes(item)
    );
    const objContexts = context.filter(
      (item) => typeof item === "object" && item !== null
    ) as Record<string, any>[];

    if (tdContexts.length > 0) {
      if (objContexts.length > 0) {
        const newObjContexts = objContexts.map((obj) =>
          "schema" in obj ? obj : { schema: SCHEMA_URL, ...obj }
        );
        return [...tdContexts, ...newObjContexts];
      } else {
        return [...tdContexts, { schema: SCHEMA_URL }];
      }
    }
    return context;
  }
  return context;
}

export function extractPlaceholders(td: string): string[] {
  let regex: RegExp = /{{/gi;
  let result: RegExpExecArray | null;
  let startIndices: number[] = [];
  while ((result = regex.exec(td))) {
    startIndices.push(result.index);
  }
  regex = /}}/gi;
  let endIndices: number[] = [];
  while ((result = regex.exec(td))) {
    endIndices.push(result.index);
  }
  let placeholders: string[] = [];
  for (let i = 0; i < startIndices.length; i++) {
    placeholders.push(td.slice(startIndices[i] + 2, endIndices[i]));
  }
  return [...new Set(placeholders)];
}

/**
 * Filters an affordance object (properties, actions, events) to only include allowed/selected keys.
 * @param affordanceObj The original affordance object (e.g., parse["properties"])
 * @param allowedKeys Array of keys to keep (e.g., properties)
 * @returns A new object with only the allowed keys
 */
export function filterAffordances<T extends Record<string, any>>(
  affordanceObj: T,
  allowedKeys: string[]
): {
  [key: string]: object;
} {
  return Object.keys(affordanceObj)
    .filter((key: string) => allowedKeys.includes(key))
    .reduce(
      (
        obj: {
          [key: string]: object;
        },
        key: string
      ) => {
        obj[key] = affordanceObj[key];
        return obj;
      },
      {} as T
    );
}

export function processConversionTMtoTD(
  tmContent: string,
  placeholderValues: Record<string, string>,
  properties: string[],
  actions: string[],
  events: string[],
  versionInput: string
) {
  const processedContent = replacePlaceholders(tmContent, placeholderValues);

  try {
    const parsed = JSON.parse(processedContent);

    // Filter affordances
    if (parsed.properties) {
      parsed.properties = filterAffordances(parsed.properties, properties);
    }
    if (parsed.actions) {
      parsed.actions = filterAffordances(parsed.actions, actions);
    }
    if (parsed.events) {
      parsed.events = filterAffordances(parsed.events, events);
    }

    if (!isVersionValid(parsed)) {
      let objectVersion = parsed["version"];

      parsed["version"] = {
        ...objectVersion,
        instance:
          versionInput === "" ? generateCurrentTimestampISO() : versionInput,
      };
    }

    if (parsed["@type"]) {
      if (Array.isArray(parsed["@type"])) {
        parsed["@type"] = parsed["@type"].filter(
          (x: String) => x != "tm:ThingModel"
        );
        if (parsed["@type"].length == 0) {
          delete parsed["@type"];
        }
      } else {
        delete parsed["@type"];
      }
    }
    delete parsed["tm:required"];
    return parsed;
  } catch (error) {
    console.error("Error processing TM:", error);
    return null;
  }
}

/**
 * Replaces placeholder variables in a string with their values
 * @param content The string containing placeholders in format {{placeholderName}}
 * @param placeholderValues Object mapping placeholder names to their values
 * @returns String with all placeholders replaced with their values
 */
export function replacePlaceholders(
  content: string,
  placeholderValues: Record<string, string>
): string {
  let processedContent = content;

  Object.entries(placeholderValues).forEach(([key, value]) => {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      processedContent = processedContent
        .replace(new RegExp(`"{{${key}}}"`, "g"), value)
        .replace(new RegExp(`{{${key}}}`, "g"), value);
    } else {
      processedContent = processedContent.replace(
        new RegExp(`{{${key}}}`, "g"),
        value
      );
    }
  });

  return processedContent;
}

/**
 * Replaces a string within all occurrences of a specific key, but only at the TOP LEVEL of a JSON structure
 *
 * @param jsonStructure - The JSON structure to modify (e.g., backgroundTdToSend)
 * @param targetKey - The key to look for (e.g., 'base', 'href')
 * @param searchString - The string to search for (e.g., 'modbus:')
 * @param replaceString - The string to replace it with (e.g., 'http:')
 * @returns A new JSON structure with top-level occurrences replaced
 *
 * @example
 * const updatedTd = replaceTopLevelString(
 *   backgroundTdToSend,
 *   'base',
 *   'modbus:',
 *   'http:'
 * );
 */
export function replaceStringOnTopLevelKey(
  jsonStructure: ThingDescription,
  targetKey: string,
  searchString: string,
  replaceString: string
): {
  modifiedStructure: ThingDescription;
  summary: {
    keyFound: boolean;
    replacementMade: boolean;
    targetKey: string;
    searchString: string;
    replaceString: string;
  };
} {
  if (!jsonStructure || typeof jsonStructure !== "object") {
    throw new Error("Invalid structure: Must be a valid JSON object");
  }

  if (!targetKey || typeof targetKey !== "string") {
    throw new Error("Target key must be a non-empty string");
  }

  const result = { ...jsonStructure };

  let keyFound = false;
  let replacementMade = false;

  if (targetKey in result && typeof result[targetKey] === "string") {
    keyFound = true;
    const originalValue = result[targetKey];

    const regex = new RegExp(searchString, "g");

    result[targetKey] = result[targetKey].replace(regex, replaceString);

    if (originalValue !== result[targetKey]) {
      replacementMade = true;
    }
  }

  return {
    modifiedStructure: result,
    summary: {
      keyFound,
      replacementMade,
      targetKey,
      searchString,
      replaceString,
    },
  };
}

/**
 * Generates a unique URN-based ID and assigns it to the Thing Description
 *
 * @param thingDescription - The Thing Description to update with a new ID
 * @returns The Thing Description with the updated ID in urn:uuid format
 */
export function generateIdForThingDescription(
  thingDescription: ThingDescription
): ThingDescription {
  const updatedTD = { ...thingDescription };
  const uniqueId = uuidv4();
  updatedTD.id = `urn:${uniqueId}`;
  return updatedTD;
}

/**
 *
 * @param td - The original Thing Description
 * @param placeholderValues - Values to replace placeholders in the TD
 * @returns The prepared Thing Description or undefined if an error occurs
 */
export function prepareTdForSubmission(
  td: ThingDescription,
  placeholderValues: Record<string, string>
): ThingDescription {
  try {
    const tdString = JSON.stringify(td);
    const replacedTdString =
      Object.keys(placeholderValues).length > 0
        ? replacePlaceholders(tdString, placeholderValues)
        : tdString;

    const parsedTd = JSON.parse(replacedTdString);
    const {
      "@type": typeValue,
      "tm:required": tmRequired,
      ...cleanedTd
    } = parsedTd;

    const tdWithNewId = generateIdForThingDescription(cleanedTd);

    return tdWithNewId;
  } catch (error) {
    throw new Error(
      `Error preparing TD for submission: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export function isVersionValid(parsedTD: ThingDescription): boolean {
  let version = parsedTD.version;

  if (!version) return true;

  if (typeof version === "object") {
    return !version.instance ? false : true;
  }

  return false;
}
