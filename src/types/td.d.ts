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
declare interface IThingDescription {
  "@context": string | (string | { [key: string]: string })[];
  "@type"?: string;
  id?: string;
  title: string;
  titles?: any;
  description?: string;
  descriptions?: any[];
  version?: any;
  created?: string;
  modified?: string;
  support?: string;
  base?: string;
  securityDefinitions: Record<string, ISecurityScheme>;
  security: string | string[];
  properties?: Record<string, IProperty>;
  actions?: Record<string, IAction>;
  events?: Record<string, IEvent>;
  links?: any[];
  forms?: IForm[];
  profile?: any;
  schemaDefinitions?: any;
  uriVairables?: any;
}

interface ISecurityScheme {
  scheme: string;
  description?: string;
  [key: string]: any;
}

interface IForm {
  href?: string;
  contentType?: string;
  op?: string | string[];
  security?: string[];
  [key: string]: any;
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

interface IModbusForm extends IForm {
  "modbus:unitID": number;
  "modbus:address": number;
  "modbus:quantity": number;
  "modbus:type"?: string;
  "modbus:zeroBasedAddressing": boolean;
  "modbus:entity"?: string;
  "modbus:pollingTime"?: string;
  "modbus:function"?: string;
  "modbus:mostSignificantByte": boolean;
  "modbus:mostSignificantWord": boolean;
  "modbus:timeout"?: string;
}

interface IProperty {
  type?: string;
  description?: string;
  observable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  forms: IForm[];
  [key: string]: any;
}

interface IAction {
  description?: string;
  input?: IDataSchema;
  output?: IDataSchema;
  forms: IForm[];
  [key: string]: any;
}

interface IEvent {
  description?: string;
  data?: IDataSchema;
  forms: IForm[];
  [key: string]: any;
}

interface IDataSchema {
  type?: string;
  description?: string;
  enum?: any[];
  minimum?: number;
  maximum?: number;
  [key: string]: any;
}
declare module "*.png" {
  const value: string;
  export default value;
}
