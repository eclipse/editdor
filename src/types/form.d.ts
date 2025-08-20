import { ThingDescription } from "wot-thing-description-types";

type ServiantCallback = (
  td: ThingDescription,
  propertyName: string,
  content: any
) => Promise<{ result: string; err: Error | null }>;

type ThirdPartyCallback = (
  baseUrl: string,
  href: string,
  valuePath: string
) => Promise<{ result: string; err: string | null }>;

export interface IFormConfigurations {
  color: string;
  title: string;
  level: "thing" | "properties" | "actions" | "events";
  callback: ServiantCallback | null;
  thirdPartyCallback: ThirdPartyCallback | null;
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
