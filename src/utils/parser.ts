type CsvData = {
  name: string;
  title: string;
  description?: string;
  type: string;
  minimum?: string;
  maximum?: string;
  unit?: string;
  href: string;
  "modbus:unitID": number;
  "modbus:address": string;
  "modbus:quantity": string;
  "modbus:type"?: string;
  "modbus:zeroBasedAddressing": string;
  "modbus:entity": string;
  "modbus:pollingTime"?: string;
  "modbus:function": string;
  "modbus:mostSignificantByte": string;
  "modbus:mostSignificantWord": string;
  "modbus:timeout"?: string;
};

type PropertyForm = {
  op: string | string[];
  href: string;
  "modbus:unitID": number;
  "modbus:address": number;
  "modbus:quantity": number;
  "modbus:type": string;
  "modbus:zeroBasedAddressing": boolean;
  "modbus:entity": string;
  "modbus:pollingTime"?: string;
  "modbus:function": string;
  "modbus:mostSignificantByte": boolean;
  "modbus:mostSignificantWord": boolean;
  "modbus:timeout"?: string;
};

type Property = {
  type: string;
  readOnly?: boolean;
  title: string;
  description: string;
  minimum?: number;
  maximum?: number;
  unit?: string;
  forms: PropertyForm[];
};

type Properties = {
  [key: string]: Property;
};

/**
 * Parses a CSV string into an array of objects of type CsvData.
 * @param csvContent - The CSV content as a string.
 * @param hasHeaders - Whether the CSV has headers (default: true).
 * @param character - The character used to separate values (default: ",").
 * @returns An array of objects (if headers are present) or arrays (if no headers).
 */
export const parseCsv = (
  csvContent: string,
  hasHeaders: boolean = true,
  character: string
): CsvData[] => {
  const rows = csvContent
    .split("\n")
    .map((row) => row.trim())
    .filter((row) => row.length > 0);

  if (hasHeaders) {
    const headers = rows[0].split(character).map((header) => header.trim());
    return rows.slice(1).map((row) => {
      const values = row.split(character).map((value) => value.trim());
      return headers.reduce((acc, header, index) => {
        acc[header] = values[index];
        return acc;
      }, {} as CsvData);
    });
  } else {
    throw new Error("CSV parsing without headers is not supported");
  }
};

/**
 *
 * @param row
 * @returns
 */
const mapRowToProperty = (row: CsvData): Property => ({
  type: row.type ?? "",
  readOnly: true,
  title: row.title ?? "",
  description: row.description ?? "",
  minimum: row.minimum ? Number(row.minimum) : undefined,
  maximum: row.maximum ? Number(row.maximum) : undefined,
  unit: row.unit,
  forms: [
    {
      op: "readproperty",
      href: row.href,
      "modbus:unitID": Number(row["modbus:unitID"]) ?? 1,
      "modbus:address": Number(row["modbus:address"]),
      "modbus:quantity": Number(row["modbus:quantity"]) ?? 1,
      "modbus:type": row["modbus:type"] ?? "",
      "modbus:zeroBasedAddressing":
        Boolean(row["modbus:zeroBasedAddressing"]) ?? false,
      "modbus:entity": row["modbus:entity"],
      "modbus:pollingTime": row["modbus:pollingTime"],
      "modbus:function": row["modbus:function"],
      "modbus:mostSignificantByte":
        Boolean(row["modbus:mostSignificantByte"]) ?? true,
      "modbus:mostSignificantWord":
        Boolean(row["modbus:mostSignificantWord"]) ?? true,
      "modbus:timeout": row["modbus:timeout"],
    },
  ],
});

/**
 *
 * @param data
 * @returns
 */
export const mapCsvToProperties = (data: CsvData[]): Properties =>
  data.reduce((acc, row) => {
    acc[row.name] = mapRowToProperty(row);
    return acc;
  }, {} as Properties);
