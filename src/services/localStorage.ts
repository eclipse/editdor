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
import { requestWeb } from "./thingsApiService";
import { Method, RequestWebOptions } from "../types/td";
const TARGET_URL_NORTHBOUND_KEY: string = "northbound";
const TARGET_URL_SOUTHBOUND_KEY: string = "southbound";
const TARGET_URL_VALUEPATH_KEY: string = "valuePath";

/**

 * Returns the target url stored in local storage or an empty string if nothing
 * is stored.
 * @returns string
 */
const getTargetUrl = (
  boundType: "northbound" | "southbound" | "valuePath"
): string => {
  let targetUrlKey: string;

  switch (boundType) {
    case "northbound":
      targetUrlKey = TARGET_URL_NORTHBOUND_KEY;
      break;
    case "southbound":
      targetUrlKey = TARGET_URL_SOUTHBOUND_KEY;
      break;
    case "valuePath":
      targetUrlKey = TARGET_URL_VALUEPATH_KEY;
      break;
    default:
      return ""; // Or throw an error, depending on your needs
  }

  const targetUrl = localStorage.getItem(targetUrlKey);

  if (targetUrl === null) {
    return "";
  }

  return targetUrl || "";
};

/**
 * Sets a new target url by persisting it via the local storage API.
 * @param {string} targetUrl
 * @returns
 */
const setTargetUrl = (
  targetUrl: string,
  boundType: "northbound" | "southbound" | "valuePath"
): void => {
  let targetUrlKey: string;

  switch (boundType) {
    case "northbound":
      targetUrlKey = TARGET_URL_NORTHBOUND_KEY;
      break;
    case "southbound":
      targetUrlKey = TARGET_URL_SOUTHBOUND_KEY;
      break;
    case "valuePath":
      targetUrlKey = TARGET_URL_VALUEPATH_KEY;
      break;
    default:
      return;
  }

  if (targetUrl === "") {
    localStorage.setItem(targetUrlKey, "");
    return;
  }

  localStorage.setItem(targetUrlKey, targetUrl);
};

interface HttpSuccessResponse {
  data: Response;
  headers: string;
  status: number;
}

interface HttpErrorResponse {
  message: string;
  reason: string;
}

type HttpResponse = HttpSuccessResponse | HttpErrorResponse;

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

      switch (response.status) {
        case 301:
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
    };

    return errorResponse;
  }
};

export { getTargetUrl, setTargetUrl, isSuccessResponse, handleHttpRequest };
