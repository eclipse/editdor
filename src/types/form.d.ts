import { ThingDescription } from "wot-thing-description-types";

type ServientCallback = (
  td: ThingDescription,
  propertyName: string,
  content: any,
  valuePath: string
) => Promise<{ result: string; err: Error | null }>;

export interface IFormConfigurations {
  color: string;
  title: string;
  level: "thing" | "properties" | "actions" | "events";
  callback: ServientCallback | null;
}

interface IFormProps {
  href: string;
  op: string | string[];
  propName: string;
  actualIndex: number;
}

type OpKeys =
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
