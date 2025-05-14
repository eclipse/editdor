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
import React, { useMemo } from "react";
import BasePagination from "./BasePagination";
import ButtonSwap from "./ButtonSwap";
import Icon from "../../InfoIcon/Icon";
import { Eye, Check } from "react-feather";

// Type definitions
export interface TableHeader {
  key: string;
  text: string;
  sort?: boolean;
}

export interface TableItem {
  id?: string | number;
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
  onSendRequestClick?: (item: T) => void;

  className?: string;
  renderItem?: (item: T, headerKey: string) => React.ReactNode;
  placeholder?: React.ReactNode;
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
}: BaseTableProps<T>): JSX.Element => {
  const colWidth = useMemo(() => {
    const width = Math.floor(100 / headers.length);
    switch (width) {
      case 25:
        return "w-1/4";
      case 33:
        return "w-1/3";
      case 50:
        return "w-1/2";
      default:
        return "grow";
    }
  }, [headers.length]);

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
      case "previewProperty":
        return (
          <div className="flex h-full w-full items-center justify-center px-2 py-1">
            <div
              className="flex h-full w-full pl-6"
              onClick={() => onSendRequestClick?.(item)}
            >
              <Icon
                id="check"
                html="Click to send request"
                IconComponent={Check}
              />
            </div>
            <div
              className="h-full w-full pl-2"
              onClick={() => onRowClick?.(item, "viewPropertyElementForm")}
            >
              <Icon
                id="eye"
                html="Click to preview property"
                IconComponent={Eye}
              />
            </div>
          </div>
        );

      case "propName":
        return (
          <div
            className="flex h-full w-full items-center justify-center px-2 py-1"
            onClick={() => onRowClick?.(item, "viewProperty")}
          >
            {value}
          </div>
        );

      case "modbus:entity":
        return renderSelect(
          value,
          ["coil", "discreteinput", "holdingregister", "inputregister"],
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
      return value;
    }

    if (typeof value === "number") {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) =>
            onCellClick?.(item, headerKey, Number(e.target.value))
          }
          className="w-full rounded bg-gray-600 px-2 py-1 text-center text-sm font-bold"
        />
      );
    }

    return value;
  };

  return (
    <BasePagination items={orderedItems} itemsPerPage={itemsPerPage}>
      {({ items: paginatedItems }) => (
        <div className={`w-full ${className}`}>
          {/* Headers */}
          <div className="flex">
            {headers.map((header, index) => (
              <div
                key={`header-${header.key}`}
                className={`text-elevation-0-1 my-2.5 flex h-auto items-center text-center text-sm font-bold text-white ${
                  index === 0
                    ? "justify-start pl-5"
                    : index === headers.length - 1
                      ? "justify-end pr-5"
                      : "justify-center"
                } `}
                style={{
                  width: `${100 / headers.length}%`,
                  wordWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                }}
              >
                <div>{header.text}</div>
              </div>
            ))}
          </div>

          {/* Rows */}
          {paginatedItems.length > 0 ? (
            paginatedItems.map((item, rowIndex) => (
              <div
                key={`row-${item.id || rowIndex}`}
                className={`hover:bg-elevation-1-hover my-2 flex rounded border border-transparent text-white transition-all`}
              >
                {headers.map((header, colIndex) => (
                  <div
                    key={`cell-${rowIndex}-${header.key}`}
                    className={`flex h-full items-center overflow-hidden text-ellipsis rounded border border-transparent ${
                      colIndex > 0 && colIndex < headers.length - 1
                        ? "justify-center"
                        : ""
                    } ${
                      colIndex === headers.length - 1
                        ? "justify-end rounded-r"
                        : ""
                    } ${
                      item.status === "info" && colIndex === 0
                        ? "border-l-info"
                        : ""
                    } ${
                      item.status === "error" && colIndex === 0
                        ? "border-l-definitive"
                        : ""
                    } ${
                      colIndex > 1 ? "hover:border-white" : ""
                    } "bg-elevation-1-hover"`}
                    style={{ width: `${100 / headers.length}%` }}
                  >
                    {renderCell(item, header.key)}
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div
              className={`flex items-end justify-center py-6 ${contrast ? "bg-elevation-1-hover" : "bg-elevation-1"} `}
            >
              {placeholder || (
                <div className="text-elevation-0-1 text-sm font-bold">
                  No entries
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </BasePagination>
  );
};

export default BaseTable;
