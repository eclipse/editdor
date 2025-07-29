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
const TARGET_URL_NORTHBOUND_KEY: string = "target-url-northbound";
const TARGET_URL_SOUTHBOUND_KEY: string = "target-url-southbound";
const NORTHBOUND_ENDPOINT = "./things";
const SOUTHBOUND_ENDPOINT = "/things";
/**

 * Returns the target url stored in local storage or an empty string if nothing
 * is stored.
 * @returns string
 */
const getTargetUrl = (boundType: "northbound" | "southbound"): string => {
  const targetUrl = localStorage.getItem(
    boundType === "northbound"
      ? TARGET_URL_NORTHBOUND_KEY
      : TARGET_URL_SOUTHBOUND_KEY
  );
  if (targetUrl === null) {
    return "";
  }

  return targetUrl;
};

/**
 * Sets a new target url by persisting it via the local storage API.
 * @param {string} targetUrl
 * @returns
 */
const setTargetUrl = (
  targetUrl: string,
  boundType: "northbound" | "southbound"
): void => {
  if (targetUrl != "" && !targetUrl.endsWith("/")) {
    targetUrl = targetUrl + "/";
  }
  localStorage.setItem(
    boundType === "northbound"
      ? TARGET_URL_NORTHBOUND_KEY
      : TARGET_URL_SOUTHBOUND_KEY,
    targetUrl
  );
};

// when you do a post to things/ the url will change to .things/{}/.id
// localhost:8080/.things -> to fetch a list of tm
// localhost:8080/.things/urn:PowerMeter0/serial_number -> to fecth the all things model

const handleHttpRequest = async (
  endpoint: string,
  method: Method = "GET",
  body?: any,
  options: RequestWebOptions = {}
): Promise<any> => {
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
      let payload;

      try {
        payload = response;
        errorMessage = payload.error || errorMessage;
      } catch (e) {
        throw new Error(`Failed to parse error response: ${e}`);
      }

      switch (response.status) {
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
    console.log(response.headers.get("Location"));
    return {
      data: response,
      headers: JSON.stringify(response.headers),
      status: response.status,
    };
  } catch (error: any) {
    throw new Error(`Request failed: ${error.message}`);
  }
};

export {
  getTargetUrl,
  setTargetUrl,
  handleHttpRequest,
  NORTHBOUND_ENDPOINT as NORTHBOUND,
  SOUTHBOUND_ENDPOINT as SOUTHBOUND,
};
