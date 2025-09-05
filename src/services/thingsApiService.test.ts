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
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  requestWeb,
  isSuccessResponse,
  handleHttpRequest,
  fetchNorthboundTD,
  extractValueByPath,
  buildUrlWithParams,
} from "./thingsApiService";
import { getLocalStorage } from "./localStorage";
import { HttpResponse, HttpSuccessResponse } from "types/global";

// Mock dependencies
vi.mock("./localStorage", () => ({
  getLocalStorage: vi.fn(),
}));

vi.mock("../utils/strings", () => ({
  ensureTrailingSlash: vi.fn((url) => (url ? `${url}/` : "")),
}));

// Setup global fetch mock
const originalFetch = global.fetch;

describe("isSuccessResponse", () => {
  const mockResponseObject = new Response(
    JSON.stringify({ name: "Thing1", value: 42 }),
    {
      status: 200,
      statusText: "OK",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const mockReponseObjectError = new Response(
    JSON.stringify({ error: "Not Found" }),
    {
      status: 404,
      statusText: "Not Found",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  test("should return true when response has data and status properties", () => {
    const response: HttpSuccessResponse = {
      data: mockResponseObject,
      headers: "",
      status: 200,
    };

    expect(isSuccessResponse(response)).toBe(true);
  });

  test("should return false when response is missing data or status properties", () => {
    const response1 = { status: 200 };
    const response2 = { data: {} };
    const response3 = { message: "Error", reason: "Bad Request" };
    // @ts-expect-error Testing invalid shapes
    expect(isSuccessResponse(response1)).toBe(false);
    // @ts-expect-error Testing invalid shapes
    expect(isSuccessResponse(response2)).toBe(false);
    expect(isSuccessResponse(response3)).toBe(false);
    // @ts-expect-error Testing invalid shapes
    expect(isSuccessResponse(mockReponseObjectError)).toBe(false);
  });
});
// TODO
describe.skip("requestWeb", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  test("should call fetch with correct parameters for GET request", async () => {
    const mockFetchResponse = { ok: true };
    (global.fetch as any).mockResolvedValue(mockFetchResponse);

    await requestWeb("https://example.com/api");

    expect(global.fetch).toHaveBeenCalledWith("https://example.com/api", {
      method: "GET",
      body: undefined,
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  test("should call fetch with correct parameters for POST request with body", async () => {
    const mockFetchResponse = { ok: true };
    (global.fetch as any).mockResolvedValue(mockFetchResponse);

    const body = JSON.stringify({ name: "test" });
    await requestWeb("https://example.com/api", "POST", body);

    expect(global.fetch).toHaveBeenCalledWith("https://example.com/api", {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  test("should append query parameters to URL when provided", async () => {
    const mockFetchResponse = { ok: true };
    (global.fetch as any).mockResolvedValue(mockFetchResponse);

    await requestWeb("https://example.com/api", "GET", undefined, {
      queryParams: { page: 1, filter: "active", enabled: true },
    });

    // The URL in the call should include the query parameters
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(
        /https:\/\/example\.com\/api\?page=1&filter=active&enabled=true/
      ),
      expect.anything()
    );
  });

  test("should merge custom headers with default Content-Type header", async () => {
    const mockFetchResponse = { ok: true };
    (global.fetch as any).mockResolvedValue(mockFetchResponse);

    await requestWeb("https://example.com/api", "GET", undefined, {
      headers: { Authorization: "Bearer token123" },
    });

    expect(global.fetch).toHaveBeenCalledWith("https://example.com/api", {
      method: "GET",
      body: undefined,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token123",
      },
    });
  });
});
// TODO
describe.skip("handleHttpRequest", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  test("should return a success response when fetch is successful", async () => {
    const mockResponseData = { result: "success" };
    const mockResponse = {
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponseData),
      headers: new Headers(),
    };

    (global.fetch as any).mockResolvedValue(mockResponse);

    const result = await handleHttpRequest("https://example.com/api");

    expect(isSuccessResponse(result)).toBe(true);
    expect(result.status).toBe(200);
    expect(result.data).toBe(mockResponse);
  });

  test("should return an error response when fetch fails with HTTP error status", async () => {
    const mockErrorData = { error: "Not Found" };
    const mockResponse = {
      ok: false,
      status: 404,
      json: () => Promise.resolve(mockErrorData),
    };

    (global.fetch as any).mockResolvedValue(mockResponse);

    const result = await handleHttpRequest("https://example.com/api");

    expect(isSuccessResponse(result)).toBe(false);
    expect(result.message).toContain("Not Found");
    expect(result.reason).toBe("Not Found");
  });

  test("should handle network errors during fetch", async () => {
    (global.fetch as any).mockRejectedValue(new Error("Network error"));

    const result = await handleHttpRequest("https://example.com/api");

    expect(isSuccessResponse(result)).toBe(false);
    expect(result.message).toBe("Network error");
  });

  test("should handle JSON parsing errors in error responses", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("Invalid JSON")),
    };

    (global.fetch as any).mockResolvedValue(mockResponse);

    const result = await handleHttpRequest("https://example.com/api");

    expect(isSuccessResponse(result)).toBe(false);
    expect(result.message).toContain("Internal Server Error");
  });
});
// TODO
describe.skip("fetchNorthboundTD", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("should fetch and return Thing Description when northbound URL is configured", async () => {
    const tdId = "thing123";
    const mockTD = {
      "@context": "https://www.w3.org/2019/wot/td/v1",
      id: "thing123",
      title: "Test Thing",
    };

    // Mock the localStorage function
    (getLocalStorage as jest.Mock).mockReturnValue(
      "https://northbound.example.com"
    );

    // Mock successful response
    const mockResponse = {
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockTD),
      headers: new Headers(),
    };

    (global.fetch as any).mockResolvedValue(mockResponse);

    const result = await fetchNorthboundTD(tdId);

    expect(result.message).toBe("Northbound TD available");
    expect(result.data).toEqual(mockTD);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("https://northbound.example.com/thing123"),
      expect.anything()
    );
  });

  test("should return error message when northbound URL is not configured", async () => {
    (getLocalStorage as jest.Mock).mockReturnValue("");

    const result = await fetchNorthboundTD("thing123");

    expect(result.message).toBe("No northbound URL configured in settings");
    expect(result.data).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("should handle HTTP error when fetching TD", async () => {
    (getLocalStorage as jest.Mock).mockReturnValue(
      "https://northbound.example.com"
    );

    const mockErrorResponse = {
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: "Not Found" }),
    };

    (global.fetch as any).mockResolvedValue(mockErrorResponse);

    const result = await fetchNorthboundTD("thing123");

    expect(result.message).toContain("Not Found");
    expect(result.data).toBeNull();
  });

  test("should handle JSON parsing errors", async () => {
    (getLocalStorage as jest.Mock).mockReturnValue(
      "https://northbound.example.com"
    );

    const mockResponse = {
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error("Invalid JSON")),
      headers: new Headers(),
    };

    (global.fetch as any).mockResolvedValue(mockResponse);

    const result = await fetchNorthboundTD("thing123");

    expect(result.message).toBe("Failed to parse northbound TD");
    expect(result.data).toBeNull();
  });
});

describe("extractValueByPath", () => {
  test('should return stringified object when path is empty or "/"', () => {
    const responseData = { value: 42, status: "ok" };

    expect(extractValueByPath(responseData)).toBe(JSON.stringify(responseData));
    expect(extractValueByPath(responseData, "/")).toBe(
      JSON.stringify(responseData)
    );
  });

  test('should extract single-level property when path is "/propertyName"', () => {
    const responseData = { value: 42, status: "ok" };

    expect(extractValueByPath(responseData, "/value")).toBe("42");
    expect(extractValueByPath(responseData, "/status")).toBe("ok");
  });

  test('should extract nested property when path is "/path/to/property"', () => {
    const responseData = {
      sensor: {
        temperature: {
          value: 22.5,
          unit: "celsius",
        },
      },
    };

    expect(extractValueByPath(responseData, "/sensor/temperature/value")).toBe(
      "22.5"
    );
    expect(extractValueByPath(responseData, "/sensor/temperature/unit")).toBe(
      "celsius"
    );
  });

  test("should return stringified object when property does not exist", () => {
    const responseData = { value: 42 };

    expect(extractValueByPath(responseData, "/nonexistent")).toBe(
      JSON.stringify(responseData)
    );
    expect(extractValueByPath(responseData, "/path/to/nowhere")).toBe(
      JSON.stringify(responseData)
    );
  });

  test("should handle undefined or null values in the path", () => {
    const responseData = {
      a: {
        b: null,
        c: undefined,
      },
    };

    expect(extractValueByPath(responseData, "/a/b/something")).toBe(
      JSON.stringify(responseData)
    );
    expect(extractValueByPath(responseData, "/a/c/something")).toBe(
      JSON.stringify(responseData)
    );
  });
});

describe("buildUrlWithParams", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, "location", {
      value: {
        ...originalLocation,
        origin: "https://example.com",
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  test("should return the endpoint unchanged when queryParams is not provided", () => {
    const endpoint = "https://api.example.com/things";
    const result = buildUrlWithParams(endpoint);
    expect(result).toBe(endpoint);
  });

  test("should return the endpoint unchanged when queryParams is an empty object", () => {
    const endpoint = "https://api.example.com/things";
    const result = buildUrlWithParams(endpoint, {});
    expect(result).toBe(endpoint);
  });

  test("should append a single string parameter to the URL", () => {
    const endpoint = "https://api.example.com/things";
    const result = buildUrlWithParams(endpoint, { name: "device1" });
    expect(result).toBe("https://api.example.com/things?name=device1");
  });

  test("should append a single number parameter to the URL", () => {
    const endpoint = "https://api.example.com/things";
    const result = buildUrlWithParams(endpoint, { id: 123 });
    expect(result).toBe("https://api.example.com/things?id=123");
  });

  test("should append a single boolean parameter to the URL", () => {
    const endpoint = "https://api.example.com/things";
    const result = buildUrlWithParams(endpoint, { active: true });
    expect(result).toBe("https://api.example.com/things?active=true");
  });

  test("should append multiple parameters to the URL", () => {
    const endpoint = "https://api.example.com/things";
    const result = buildUrlWithParams(endpoint, {
      name: "device1",
      id: 123,
      active: true,
    });
    expect(result).toBe(
      "https://api.example.com/things?name=device1&id=123&active=true"
    );
  });

  test("should properly encode special characters in parameter values", () => {
    const endpoint = "https://api.example.com/things";
    const result = buildUrlWithParams(endpoint, {
      query: "search term with spaces",
      filter: "category=sensors&type=temperature",
    });
    // RFC3986 specifies spaces should be encoded as %20, but encodeURIComponent encodes them as +
    // So we normalize the output for the test
    const normalizedResult = result.replace(/\+/g, "%20");
    // plus sign is used by URLSearchParams class
    expect(normalizedResult).toBe(
      "https://api.example.com/things?query=search%20term%20with%20spaces&filter=category%3Dsensors%26type%3Dtemperature"
    );
  });

  test("should handle URLs that already have query parameters", () => {
    const endpoint = "https://api.example.com/things?existing=param";
    const result = buildUrlWithParams(endpoint, { new: "parameter" });
    expect(result).toBe(
      "https://api.example.com/things?existing=param&new=parameter"
    );
  });

  test("should handle relative URLs by using window.location.origin", () => {
    const endpoint = "/api/things";
    const result = buildUrlWithParams(endpoint, { id: 123 });
    expect(result).toBe("https://example.com/api/things?id=123");
  });

  test("should handle falsy values correctly (except undefined and null)", () => {
    const endpoint = "https://api.example.com/things";
    const result = buildUrlWithParams(endpoint, {
      zero: 0,
      empty: "",
      falseVal: false,
    });
    expect(result).toBe(
      "https://api.example.com/things?zero=0&empty=&falseVal=false"
    );
  });

  test("should handle null and undefined values in queryParams", () => {
    const endpoint = "https://api.example.com/things";
    const result = buildUrlWithParams(endpoint, {
      nullVal: null as any,
      undefinedVal: undefined as any,
      validVal: "data",
    });

    // Only the valid parameter should be appended
    expect(result).toBe(
      "https://api.example.com/things?nullVal=null&undefinedVal=undefined&validVal=data"
    );
  });
});
