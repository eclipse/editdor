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
import type { ThingDescription } from "wot-thing-description-types";
import { getLocalStorage } from "./localStorage";
import { ensureTrailingSlash, extractIndexFromId } from "../utils/strings";
import { readPropertyWithServient } from "./form";

export interface ReadResult {
  value: string;
  error: string;
}

function isSuccessResponse(
  response: HttpResponse
): response is HttpSuccessResponse {
  return "data" in response && "status" in response;
}

const handleHttpRequest = async (
  endpoint: string,
  method: Method = "GET",
  body?: any,
  options: RequestWebOptions = {}
): Promise<HttpResponse> => {
  const errorDescription: HttpErrorResponse = {
    message: "",
    reason: "",
    status: 0,
  };

  try {
    const response = await requestWeb(endpoint, method, body, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;

      try {
        const errorData = await response.json();
        if (errorData?.error) {
          errorDescription.reason = errorData.error;
        }
      } catch (error) {}
      errorDescription.status = response.status;
      switch (response.status) {
        case 301:
          throw new Error(`Monitors for the property: ${errorMessage}`);
        case 304:
          throw new Error(`Not Modified: ${errorMessage}`);
        case 302:
          throw new Error(`Bad url: ${errorMessage}`);
        case 400:
          throw new Error(`Bad Request: ${errorMessage}`);
        case 401:
          throw new Error(`Unauthorized: ${errorMessage}`);
        case 403:
          throw new Error(`Forbidden: ${errorMessage}`);
        case 404:
          throw new Error(`Not Found: ${errorMessage}`);
        case 405:
          throw new Error(`Property not writable: ${errorMessage}`);
        case 406:
          throw new Error(`Invalid property value: ${errorMessage}`);
        case 409:
          throw new Error(`Conflict: ${errorMessage}`);
        case 429:
          throw new Error(`Too Many Requests: ${errorMessage}`);
        case 499:
          throw new Error(`Client Closed Request: ${errorMessage}`);
        case 500:
          throw new Error(`Internal Server Error: ${errorMessage}`);
        case 502:
          throw new Error(`Bad Gateway: ${errorMessage}`);
        case 503:
          throw new Error(`Service Unavailable: ${errorMessage}`);
        case 504:
          throw new Error(`Gateway Timeout: ${errorMessage}`);
        default:
          throw new Error(
            `Request failed with status ${response.status}: ${errorMessage}`
          );
      }
    }
    const successResponse: HttpSuccessResponse = {
      data: response,
      headers: JSON.stringify(response.headers),
      status: response.status,
    };

    return successResponse;
  } catch (error: unknown) {
    const typedError = error as Error;
    const errorResponse: HttpErrorResponse = {
      message: typedError.message,
      reason: errorDescription.reason,
      status: errorDescription.status,
    };

    return errorResponse;
  }
};

/** @internal */
const buildUrlWithParams = (
  endpoint: string,
  queryParams?: Record<string, string | number | boolean>
) => {
  if (!queryParams) return endpoint;
  const url = new URL(endpoint, window.location.origin);
  Object.entries(queryParams).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });
  return url.toString();
};

const requestWeb = async (
  endpoint: string,
  method: Method = "GET",
  body?: any,
  options: RequestWebOptions = {}
) => {
  const { headers, queryParams, ...restOptions } = options;
  const url = buildUrlWithParams(endpoint, queryParams);

  return await fetch(url, {
    method,
    body,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
      //Authorization: `Bearer ${token}`,
    },
    ...restOptions,
  });
};

const fetchNorthboundTD = async (
  tdId: string
): Promise<{ message: string; data: ThingDescription | null }> => {
  try {
    const northboundUrl = ensureTrailingSlash(getLocalStorage("northbound"));
    if (!northboundUrl) {
      throw new Error("No northbound URL configured in settings");
    }

    const endpoint = `${northboundUrl}${encodeURIComponent(tdId)}`;

    const response = await handleHttpRequest(endpoint, "GET");

    if (isSuccessResponse(response)) {
      try {
        const responseData = await response.data.json();
        return {
          message: "Northbound TD available",
          data: responseData as ThingDescription,
        };
      } catch (error) {
        return {
          message: "Failed to parse northbound TD",
          data: null,
        };
      }
    } else {
      const errorMessage = response.message || "Failed to fetch northbound TD";
      return {
        message: errorMessage,
        data: null,
      };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      message: errorMessage,
      data: null,
    };
  }
};

/**
 * Extracts a value from response data based on a JSON Pointer-like path
 * @param responseData - The response data object
 * @param path - The path to extract (e.g., "/", "/value", "/path/value")
 * @returns The extracted value as a string
 */
const extractValueByPath = (
  responseData: ResponseDataFromNorthbound,
  path?: string
): string => {
  // Case 1: ("/")
  if (!path || path === "/") {
    return JSON.stringify(responseData);
  }

  const segments = path.split("/").filter((segment) => segment.length > 0);

  // Case 2: ("/value")
  if (segments.length === 1) {
    const key = segments[0];
    return responseData[key] !== undefined
      ? String(responseData[key])
      : JSON.stringify(responseData);
  }

  // Case 3:("/path/value")
  let current: any = responseData;

  for (const segment of segments) {
    if (current === undefined || current === null) {
      return JSON.stringify(responseData);
    }

    current = current[segment];
  }

  return current !== undefined ? String(current) : JSON.stringify(responseData);
};

/**
 * Reads all readable property forms sequentially (to avoid overwhelming the servient) and
 * returns a mapping from row id to { value, error } result objects.
 *
 * @param tdSource Thing Description (northbound TD preferred if available)
 * @param rows Flattened table rows with id pattern `${propName} - ${index}` and propName field
 * @param pathToValue Path within returned payload to extract value, passed to readPropertyWithServient
 */
async function readAllReadablePropertyForms(
  tdSource: ThingDescription,
  rows: Array<{ id: string; propName: string }>,
  pathToValue: string
): Promise<Record<string, ReadResult>> {
  const results: Record<string, ReadResult> = {};

  for (const row of rows) {
    const formIndex = extractIndexFromId(row.id);
    try {
      const res = await readPropertyWithServient(
        tdSource,
        row.propName,
        { formIndex },
        pathToValue
      );
      if (res.err) {
        results[row.id] = { value: "", error: res.err.message };
      } else {
        results[row.id] = { value: res.result, error: "" };
      }
    } catch (e: any) {
      results[row.id] = { value: "", error: e?.message || "Unknown error" };
    }
  }

  return results;
}

export {
  requestWeb,
  isSuccessResponse,
  handleHttpRequest,
  fetchNorthboundTD,
  extractValueByPath,
  buildUrlWithParams,
  readAllReadablePropertyForms,
};
