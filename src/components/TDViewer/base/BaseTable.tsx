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
import React, { useMemo, useState, useEffect } from "react";
import BasePagination from "./BasePagination";
import ButtonSwap from "./ButtonSwap";
import Icon from "../../InfoIcon/Icon";
import {
  Edit,
  XCircle,
  Check,
  Info,
  CheckCircle,
  AlertTriangle,
} from "react-feather";
import IncrementButton from "./IncrementButton";
import { extractIndexFromId, formatTextKey } from "../../../utils/strings";

export interface TableHeader {
  key: string;
  text: string;
  sort?: boolean;
}

export interface TableItem {
  id: string | number;
  selected?: boolean;
  priority?: number;
  status?: "info" | "error";
  [key: string]: any;
}

interface BaseTableProps<T extends TableItem> {
  contrast?: boolean;
  filter?: string | ((value: T, index: number, array: T[]) => boolean);
  headers: TableHeader[];
  items: T[];
  itemsPerPage?: number;
  orderBy?: keyof T | "";
  order?: "desc" | "asc";
  onRowClick?: (
    item: T,
    state: "viewProperty" | "viewPropertyElementForm"
  ) => void;
  onCellClick?: (item: T, headerKey: string, value: any) => void;
  onSendRequestClick?: (item: T) => Promise<{
    value: string;
    error: string;
  }>;
  className?: string;
  renderItem?: (item: T, headerKey: string) => React.ReactNode;
  placeholder?: React.ReactNode;
  baseUrl: string;
}

const BaseTable = <T extends TableItem>({
  contrast = false,
  filter = "",
  headers,
  items,
  itemsPerPage = 6,
  orderBy = "",
  order = "asc",
  onRowClick,
  onCellClick,
  onSendRequestClick,
  className = "",
  renderItem,
  placeholder,
  baseUrl = "",
}: BaseTableProps<T>): JSX.Element => {
  const filteredItems = useMemo(() => {
    const defaultFilterMethod = (filterValue: string) => (item: T) =>
      !filterValue?.trim() ||
      Object.values(item).some(
        (value) =>
          String(value)
            .toLowerCase()
            .indexOf((filterValue || "").toLowerCase()) >= 0
      );

    const filterMethod =
      typeof filter === "function"
        ? filter
        : defaultFilterMethod(filter as string);

    return items.filter(filterMethod);
  }, [items, filter]);

  const orderedItems = useMemo(() => {
    if (!orderBy) return filteredItems;

    const orderMultiplier = order === "asc" ? [1, -1] : [-1, 1];

    return [...filteredItems].sort((a, b) => {
      if (a[orderBy] > b[orderBy]) return orderMultiplier[0];
      if (a[orderBy] < b[orderBy]) return orderMultiplier[1];
      return 0;
    });
  }, [filteredItems, orderBy, order]);

  const [requestResults, setRequestResults] = useState<{
    [id: string]: { value: string; error: string };
  }>({});

  useEffect(() => {
    const initialResults = items.reduce(
      (acc, item) => {
        if (item.id) {
          acc[item.id] = { value: "", error: "" };
        }
        return acc;
      },
      {} as { [id: string]: { value: string; error: string } }
    );

    setRequestResults(initialResults);
  }, [items]);

  const renderSelect = (
    value: string,
    options: string[],
    headerKey: string,
    item: T
  ): React.ReactNode => {
    return (
      <select
        value={value}
        onChange={(e) => onCellClick?.(item, headerKey, e.target.value)}
        className="h-full w-full rounded bg-gray-600 px-2 py-1"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  };

  const renderCell = (item: T, headerKey: string): React.ReactNode => {
    if (renderItem) {
      return renderItem(item, headerKey);
    }

    const value = item[headerKey as keyof T];

    switch (headerKey) {
      case "previewValue":
        if (
          item["href"].startsWith("http") ||
          item["href"].startsWith("https") ||
          item["href"].startsWith("ws") ||
          item["href"].startsWith("wss")
        ) {
          return (
            <div
              className={`flex h-full w-full items-center justify-center ${
                requestResults[item.id]?.error ? "bg-red-500 text-white" : ""
              } ${requestResults[item.id]?.value ? "bg-formGreen text-black" : ""} `}
              onClick={async () => {
                if (onSendRequestClick) {
                  const result = await onSendRequestClick(item);
                  setRequestResults((prev) => ({
                    ...prev,
                    [item.id]: result,
                  }));
                }
              }}
            >
              {
                requestResults[item.id]?.error && (
                  <div className="flex items-center justify-center">
                    <h1 className="px-2">Error</h1>
                    <Icon
                      id="info"
                      html={`Error description: ${requestResults[item.id].error}`}
                      color="white"
                      IconComponent={AlertTriangle}
                    />
                  </div>
                )
                // In the value preview, if there is no error, same text field as usual. If there is error, an exclamation mark, the text "Error" and error description with tooltip
              }
              {!requestResults[item.id]?.error &&
                !requestResults[item.id]?.value && (
                  <Icon
                    id="check"
                    html="Click to send request"
                    IconComponent={Check}
                    size={20}
                  />
                )}
              {!requestResults[item.id]?.error &&
                requestResults[item.id]?.value && (
                  <div className="flex h-full w-full items-center justify-center">
                    <h1 className="px-2">{requestResults[item.id].value}</h1>
                    <Icon
                      id="checkCircle"
                      html="Successful read property in the device"
                      IconComponent={CheckCircle}
                      size={20}
                    />
                  </div>
                )}
            </div>
          );
        } else {
          return (
            <div className="flex h-full w-full items-center justify-center">
              <h1 className="px-2">Unable</h1>
              <Icon
                id="xCircle"
                html="Unable to perform non HTTP or WebSocket operations"
                IconComponent={XCircle}
                size={20}
              />
            </div>
          );
        }

      case "propName":
        let description = !item.description
          ? "No description available"
          : item.description;
        return (
          <div
            className="flex h-full w-full items-center px-1"
            onClick={() => onRowClick?.(item, "viewProperty")}
          >
            <div className="flex h-full w-full items-center">
              {formatTextKey(
                item.propName,
                extractIndexFromId(item.id as string)
              )}
            </div>
            <div className="items-center justify-center px-1">
              <Icon
                id="info"
                html={`Property description: ${description}`}
                IconComponent={Info}
              />
            </div>
          </div>
        );
      case "editForm":
        return (
          <div
            className="flex h-full w-full items-center justify-center px-2"
            onClick={() => onRowClick?.(item, "viewPropertyElementForm")}
          >
            <Icon
              id="edit"
              html="Click to preview property"
              IconComponent={Edit}
              size={20}
            />
          </div>
        );
      case "modbus:entity":
        return renderSelect(
          value,
          ["Coil", "DiscreteInput", "HoldingRegister", "InputRegister"],
          headerKey,
          item
        );

      case "modbus:function":
        return renderSelect(
          value,
          [
            "readCoil",
            "readDeviceIdentification",
            "readDiscreteInput",
            "readHoldingRegisters",
            "readInputRegisters",
            "writeMultipleCoils",
            "writeMultipleHoldingRegisters",
            "writeSingleCoil",
            "writeSingleHoldingRegister",
          ],
          headerKey,
          item
        );

      case "modbus:type":
        return renderSelect(
          value,
          [
            "integer",
            "boolean",
            "string",
            "float",
            "decimal",
            "byte",
            "short",
            "int",
            "long",
            "unsignedByte",
            "unsignedShort",
            "unsignedInt",
            "unsignedLong",
            "double",
            "hexBinary",
          ],
          headerKey,
          item
        );

      default:
        break;
    }

    if (value === null || value === undefined) {
      return "-";
    }

    if (typeof value === "boolean") {
      return (
        <ButtonSwap
          onClick={(e) => {
            e.stopPropagation();
            onCellClick?.(item, headerKey, !value);
          }}
          value={value}
          description=""
          className=""
        />
      );
    }

    if (typeof value === "string") {
      return (
        <div className="group relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onCellClick?.(item, headerKey, e.target.value)}
            onBlur={(e) => onCellClick?.(item, headerKey, e.target.value)}
            className="w-full truncate border-none bg-gray-600 px-2 py-1 text-center text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={value.length > 10 ? value : undefined}
          />
          <div className="absolute left-0 top-full mt-1 hidden w-max max-w-xs rounded bg-gray-700 px-2 py-1 text-sm text-white shadow-lg group-hover:block">
            {value}
          </div>
        </div>
      );
    }

    if (typeof value === "number") {
      return (
        <IncrementButton
          value={value}
          onUpdate={(newValue) => {
            onCellClick?.(item, headerKey, newValue);
          }}
          inferiorLimit={0}
        ></IncrementButton>
      );
    }
    return value;
  };

  return (
    <BasePagination items={orderedItems} itemsPerPage={itemsPerPage}>
      {({ items: paginatedItems }) => (
        <div className="relative overflow-x-auto">
          <div className={`inline-block ${className}`}>
            {/* HTML Table Container */}
            <table className="w-full text-nowrap">
              {/* Table Head */}
              <thead>
                <tr>
                  {headers.map((header, index) => (
                    <th
                      key={`header-${header.key}`}
                      className={`text-elevation-0-1 my-2.5 text-sm font-bold text-white ${
                        index === 0
                          ? "pl-5"
                          : index === headers.length - 1
                            ? "pr-5"
                            : "px-5"
                      }`}
                    >
                      {header.text}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item, rowIndex) => (
                    <tr key={`row-${rowIndex}-${item.id}`}>
                      {headers.map((header, colIndex) => (
                        <td key={`cell-${rowIndex}-${header.key}`}>
                          <div
                            className={`h-10 items-center overflow-hidden text-ellipsis border border-solid border-transparent text-white hover:border-white ${
                              colIndex > 0 &&
                              colIndex < headers.length - 1 &&
                              "text-center"
                            } ${
                              colIndex === headers.length - 1 &&
                              "rounded-r text-right"
                            } ${
                              item.status === "info" &&
                              colIndex === 0 &&
                              "border-l-info"
                            } ${
                              item.status === "error" &&
                              colIndex === 0 &&
                              "border-l-definitive"
                            } bg-elevation-1-hover cursor-pointer`}
                          >
                            {renderCell(item, header.key)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={headers.length}
                      className={`flex items-end justify-center py-6 ${
                        contrast ? "bg-elevation-1-hover" : "bg-elevation-1"
                      }`}
                    >
                      {placeholder || (
                        <div className="text-elevation-0-1 text-sm font-bold text-white">
                          No entries
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </BasePagination>
  );
};

export default BaseTable;
