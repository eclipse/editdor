export interface IThingDescription {
  "@context": string | string[];
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

export interface ISecurityScheme {
  scheme: string;
  description?: string;
  [key: string]: any;
}

export interface IForm {
  href: string;
  contentType?: string;
  op?: string | string[];
  security?: string[];
  [key: string]: any;
}

export interface IModbusForm extends IForm {
  "modbus:unitID"?: number;
  "modbus:address"?: number;
  "modbus:quantity"?: number;
  "modbus:zeroBasedAddressing"?: boolean;
  "modbus:entity"?: string;
  "modbus:mostSignificantByte"?: boolean;
  "modbus:mostSignificantWord"?: boolean;
}

export interface IProperty {
  type?: string;
  description?: string;
  observable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  forms: IForm[];
  [key: string]: any;
}

export interface IAction {
  description?: string;
  input?: IDataSchema;
  output?: IDataSchema;
  forms: IForm[];
  [key: string]: any;
}

export interface IEvent {
  description?: string;
  data?: IDataSchema;
  forms: IForm[];
  [key: string]: any;
}

export interface IDataSchema {
  type?: string;
  description?: string;
  enum?: any[];
  minimum?: number;
  maximum?: number;
  [key: string]: any;
}
