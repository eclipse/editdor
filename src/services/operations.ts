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
import type { ThingContext } from "wot-thing-description-types";

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

export function extractPlaceholdersRefactor(td: string): string[] {
  const regex = /{{(.*?)}}/g;
  const matches: RegExpMatchArray[] = [...td.matchAll(regex)];
  const placeholders: string[] = matches.map((match) => match[1].trim());
  return Array.from(new Set(placeholders));
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
  events: string[]
) {
  // Apply placeholder values
  let processedContent = tmContent;

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

    delete parsed["@type"];
    delete parsed["tm:required"];

    return parsed;
  } catch (error) {
    console.error("Error processing TM:", error);
    return null;
  }
}
