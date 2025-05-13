interface IThingDescription {
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
