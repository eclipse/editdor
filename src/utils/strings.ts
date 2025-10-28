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
export const extractIndexFromId = (id: string): number => {
  const parts = id.split(" - ");
  return parseInt(parts[1], 10);
};

export const formatTextKey = (key: string, index: number): string => {
  let propIndex = index + 1;
  if (index === 0) {
    return key;
  }
  return key + ` (form ${String(propIndex)})`;
};

export const formatText = (text: string): string => {
  if (text.startsWith("modbus:")) {
    text = text.replace("modbus:", "");
  }
  if (text.startsWith("propName")) {
    text = "Property Name";
  }
  if (text.startsWith("href")) {
    text = "Resource";
  }
  if (text.startsWith("htv:methodName")) {
    text = "Method";
  }
  text = text.replace(/([a-z])([A-Z])/g, "$1 $2");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const isValidUrl = (url: string): boolean => {
  const regex = /^(https?:\/\/)([\w.-]+)(:\d+)?(\/[^\s]*)?$/i;
  return regex.test(url);
};

export const capitalizeFirstLetter = (input: string): string => {
  if (input.length === 0) {
    return "";
  }
  const processed = input.startsWith(" ") ? input.substring(1) : input;

  if (processed.length === 0) {
    return "";
  }

  const isFirstCharLetter = /[a-zA-Z]/.test(processed[0]);

  if (isFirstCharLetter) {
    return processed[0].toUpperCase() + processed.slice(1);
  }

  return processed;
};

export const ensureTrailingSlash = (url: string): string => {
  if (!url) return "/";
  return url.endsWith("/") ? url : `${url}/`;
};

export function stripDoubleQuotes(str: string): string {
  return str.replace(/^"|"$/g, "");
}

export function generateCurrentTimestampISO(): string {
  return new Date().toISOString();
}
