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
const TARGET_URL_NORTHBOUND_KEY: string = "target-url-northbound";
const TARGET_URL_SOUTHBOUND_KEY: string = "target-url-southbound";

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

export { getTargetUrl, setTargetUrl };
