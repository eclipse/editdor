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
import { Method, RequestWebOptions } from "../types/td";

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

export { requestWeb, isSuccessResponse, handleHttpRequest };
