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
export const removeKeyFromObjects = (
  array: any[],
  keyToRemove: string
): any[] => {
  return array.map((obj) => {
    const { [keyToRemove]: _, ...rest } = obj;
    return rest;
  });
};

export const getErrorSummary = (array: {
  [id: string]: { value: string; error: string };
}): { firstError: { id: string; message: string }; errorCount: number } => {
  let firstError = { id: "", message: "" };
  let errorCount = 0;

  for (const [id, result] of Object.entries(array)) {
    if (result.error && result.error.length > 0) {
      errorCount++;

      if (!firstError.message) {
        const propertyName = id.split(" - ")[0];
        firstError = {
          id: propertyName,
          message: result.error,
        };
      }
    }
  }

  return {
    firstError,
    errorCount,
  };
};
