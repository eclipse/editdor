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
