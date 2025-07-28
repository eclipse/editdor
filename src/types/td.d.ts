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
import type { FormElementBase } from "wot-thing-description-types";

declare const APP_VERSION: string;

declare module "*.png" {
  const value: string;
  export default value;
}

declare const APP_VERSION: string;

declare module "*.png" {
  const value: string;
  export default value;
}

type FormOpKeys =
  | "readproperty"
  | "writeproperty"
  | "observeproperty"
  | "unobserveproperty"
  | "invokeaction"
  | "subscribeevent"
  | "unsubscribeevent"
  | "readmultipleproperties"
  | "readallproperties"
  | "writemultipleproperties"
  | "writeallproperties"
  | "observeallproperties"
  | "unobserveallproperties";

interface IFormProps extends FormElementBase {
  propName: string;
  actualIndex: number;
  op: string; //override
}

export type Method = "GET" | "POST" | "PUT" | "DELETE";

export interface RequestWebOptions extends RequestInit {
  queryParams?: Record<string, string | number | boolean>;
}
