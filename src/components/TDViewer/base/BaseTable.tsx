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
import { Eye } from "react-feather";

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
  onRowClick?: (item: T) => void;
  onCellClick?: (item: T, headerKey: string, value: any) => void;
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

  const renderCell = (item: T, headerKey: string): React.ReactNode => {
    if (renderItem) {
      return renderItem(item, headerKey);
    }

    const value = item[headerKey as keyof T];
    if (headerKey == "previewProperty") {
      return (
        <div
          className="flex h-full w-full items-center justify-center px-2 py-1"
          onClick={() => onRowClick}
        >
          <Icon id="eye" html="Click to preview property" IconComponent={Eye} />
        </div>
      );
    }
    if (value === null || value === undefined) {
      return "-";
    } else if (typeof value === "boolean") {
      return (
        <ButtonSwap
          onClick={(e) => {
            e.stopPropagation;
            onCellClick?.(item, headerKey, !value);
          }}
          value={value}
          description=""
          className=""
        ></ButtonSwap>
      );
    } else if (typeof value === "string") {
      if (headerKey === "modbus:entity") {
        return (
          <select
            value={value}
            onChange={(e) => onCellClick?.(item, headerKey, e.target.value)}
            className="h-full w-full rounded bg-gray-600 px-2 py-1"
          >
            <option value="coil">coil</option>
            <option value="discreteinput">discreteinput</option>
            <option value="holdingregister">holdingregister</option>
            <option value="inputregister">inputregister</option>
          </select>
        );
      }
      if (headerKey === "modbus:function") {
        return (
          <select
            value={value}
            onChange={(e) => onCellClick?.(item, headerKey, e.target.value)}
            className="h-full w-full rounded bg-gray-600 px-2 py-1"
          >
            <option value="readCoil">readCoil</option>
            <option value="readDeviceIdentification">
              readDeviceIdentification
            </option>
            <option value="readDiscreteInput">readDiscreteInput</option>
            <option value="readHoldingRegisters">readHoldingRegisters</option>
            <option value="readInputRegisters">readInputRegisters</option>
            <option value="writeMultipleCoils">writeMultipleCoils</option>
            <option value="writeMultipleHoldingRegisters">
              writeMultipleHoldingRegisters
            </option>
            <option value="writeSingleCoil">writeSingleCoil</option>
            <option value="writeSingleHoldingRegister">
              writeSingleHoldingRegister
            </option>
          </select>
        );
      }
      if (headerKey === "modbus:function") {
        return (
          <select
            value={value}
            onChange={(e) => onCellClick?.(item, headerKey, e.target.value)}
            className="h-full w-full rounded bg-gray-600 px-2 py-1"
          >
            <option value="readCoil">readCoil</option>
            <option value="readDeviceIdentification">
              readDeviceIdentification
            </option>
            <option value="readDiscreteInput">readDiscreteInput</option>
            <option value="readHoldingRegisters">readHoldingRegisters</option>
            <option value="readInputRegisters">readInputRegisters</option>
            <option value="writeMultipleCoils">writeMultipleCoils</option>
            <option value="writeMultipleHoldingRegisters">
              writeMultipleHoldingRegisters
            </option>
            <option value="writeSingleCoil">writeSingleCoil</option>
            <option value="writeSingleHoldingRegister">
              writeSingleHoldingRegister
            </option>
          </select>
        );
      }

      if (headerKey === "modbus:type") {
        return (
          <select
            value={value}
            onChange={(e) => onCellClick?.(item, headerKey, e.target.value)}
            className="h-full w-full rounded bg-gray-600 px-2 py-1"
          >
            <option value="integer">integer</option>
            <option value="boolean">boolean </option>
            <option value="string">string</option>
            <option value="float">float</option>
            <option value="decimal">decimal</option>
            <option value="byte">byte</option>
            <option value="short">short</option>
            <option value="int">int</option>
            <option value="long">long</option>
            <option value="unsignedByte">unsignedByte</option>
            <option value="unsignedShort">unsignedShort</option>
            <option value="unsignedInt">unsignedInt</option>
            <option value="unsignedLong">unsignedLong</option>
            <option value="double">double</option>
            <option value="hexBinary">hexBinary</option>
          </select>
        );
      }
      return value;
    } else if (typeof value === "number") {
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
    } else {
      return value;
    }
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
                onClick={() => onRowClick?.(item)}
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
