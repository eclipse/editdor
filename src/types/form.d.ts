import { ThingDescription } from "wot-thing-description-types";

export interface IFormConfigurations {
  color: string;
  title: string;
  level: "thing" | "properties" | "actions" | "events";
  callback:
    | null
    | ((
        td: ThingDescription,
        propertyName: string,
        content: string
      ) => Promise<{ result: string; err: Error | null }>)
    | ((
        td: ThingDescription,
        propertyName: string,
        options: any
      ) => Promise<{ result: string; err: Error | null }>);
}

interface FormProps {
  href: string;
  op: string | string[];
  propName: string;
  actualIndex: number;
}
