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

export { getTargetUrl, setTargetUrl };
