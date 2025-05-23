interface IFormConfigurations {
  color: string;
  title: string;
  level: "thing" | "properties" | "actions" | "events";
  callback:
    | null
    | ((td: any, propertyName: string, content: string) => Promise<any>);
}

interface FormProps {
  href: string;
  op: string | string[];
  propName: string;
  actualIndex: number;
}
