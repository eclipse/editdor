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
import React, { useContext, useState } from "react";
import ediTDorContext from "../../../context/ediTDorContext";
import {
  getAddressOffsetTooltipContent,
  getEndiannessTooltipContent,
  getUniIdTooltipContent,
} from "../../InfoIcon/TooltipMapper";
import type { ThingDescription } from "wot-thing-description-types";
import SingleIncrementButton from "../base/SingleIncrementButton";
import SingleSwapButton from "../base/SingleSwapButton";
import DoubleSwapButton from "../base/DoubleSwapButton";

interface IEndianness {
  wordSwap: boolean;
  byteSwap: boolean;
}

interface IValidationResults {
  unitID: boolean;
  zeroBasedAddressing: boolean;
  mostSignificantWord: boolean;
  mostSignificantByte: boolean;
}

interface IEditPropertiesProps {
  isBaseModbus: boolean;
}
type ModbusThingDescription = ThingDescription & {
  properties?: Record<
    string,
    {
      forms?: Array<
        {
          "modbus:mostSignificantWord"?: boolean;
          "modbus:mostSignificantByte"?: boolean;
          "modbus:unitID"?: number;
          "modbus:zeroBasedAddressing"?: boolean;
        } & Record<string, any>
      >;
    } & Record<string, any>
  >;
};

const EditProperties: React.FC<IEditPropertiesProps> = (props) => {
  const context = useContext(ediTDorContext);

  const td = context.parsedTD as ModbusThingDescription;
  const [unitId, setUnitId] = useState<number>(0);

  const [addressOffset, setAddressOffset] = useState<boolean>(true);
  const [endianness, setEndianness] = useState<IEndianness>({
    wordSwap: false,
    byteSwap: false,
  });

  const updateModbusProperty = (
    propertyKey: string,
    newValue: any,
    type?: string
  ) => {
    if (!td.properties) return;

    Object.entries(td.properties).forEach(([key, property]) => {
      if (property.forms) {
        property.forms.forEach((form) => {
          if (!form.href) {
            alert(`Form href is empty on property: ${key}`);
            return;
          }
          if (
            props.isBaseModbus ||
            form.href.startsWith("modbus://") ||
            form.href.startsWith("modbus+tcp://")
          ) {
            if (type === "endianness") {
              if (propertyKey === "wordSwap") {
                form["modbus:mostSignificantWord"] = newValue;
              } else if (propertyKey === "byteSwap") {
                form["modbus:mostSignificantByte"] = newValue;
              }
            } else {
              form[propertyKey] = newValue;
            }
          }
        });
      }
    });

    context.updateOfflineTD(JSON.stringify(td, null, 2));
  };

  const handleUnitIdUpdate = (newValue: number) => {
    setUnitId(newValue);
    updateModbusProperty("modbus:unitID", newValue);
  };

  const handleAddressOffsetUpdate = (newValue: boolean) => {
    setAddressOffset(newValue);
    updateModbusProperty("modbus:zeroBasedAddressing", newValue);
  };

  const handleEndiannessUpdate = (newValue: boolean, type: string) => {
    setEndianness((prev) => ({ ...prev, [type]: newValue }));
    updateModbusProperty(type, newValue, "endianness");
  };

  const validateModbusProperties: IValidationResults = React.useMemo(() => {
    const results: IValidationResults = {
      unitID: true,
      zeroBasedAddressing: true,
      mostSignificantWord: true,
      mostSignificantByte: true,
    };

    if (!td.properties) return results;

    const firstValues: {
      unitID?: number;
      zeroBasedAddressing?: boolean;
      mostSignificantWord?: boolean;
      mostSignificantByte?: boolean;
    } = {};

    const foundAny: {
      unitID: boolean;
      zeroBasedAddressing: boolean;
      mostSignificantWord: boolean;
      mostSignificantByte: boolean;
    } = {
      unitID: false,
      zeroBasedAddressing: false,
      mostSignificantWord: false,
      mostSignificantByte: false,
    };

    for (const [key, property] of Object.entries(td.properties)) {
      if (!property.forms) continue;

      for (const form of property.forms) {
        if (!form.href) continue;

        if (
          props.isBaseModbus ||
          form.href.startsWith("modbus://") ||
          form.href.startsWith("modbus+tcp://")
        ) {
          const currentUnitId = form["modbus:unitID"];
          if (currentUnitId !== undefined) {
            if (!foundAny.unitID) {
              firstValues.unitID = currentUnitId;
              foundAny.unitID = true;

              if (unitId !== currentUnitId) {
                setUnitId(currentUnitId);
              }
            } else if (currentUnitId !== firstValues.unitID) {
              results.unitID = false;
            }
          }

          const currentZeroBasedAddressing = form["modbus:zeroBasedAddressing"];
          if (currentZeroBasedAddressing !== undefined) {
            if (!foundAny.zeroBasedAddressing) {
              firstValues.zeroBasedAddressing = currentZeroBasedAddressing;
              foundAny.zeroBasedAddressing = true;

              if (addressOffset !== currentZeroBasedAddressing) {
                setAddressOffset(currentZeroBasedAddressing);
              }
            } else if (
              currentZeroBasedAddressing !== firstValues.zeroBasedAddressing
            ) {
              results.zeroBasedAddressing = false;
            }
          }

          const currentMostSignificantWord = form["modbus:mostSignificantWord"];
          if (currentMostSignificantWord !== undefined) {
            if (!foundAny.mostSignificantWord) {
              firstValues.mostSignificantWord = currentMostSignificantWord;
              foundAny.mostSignificantWord = true;

              if (endianness.wordSwap !== currentMostSignificantWord) {
                setEndianness((prev) => ({
                  ...prev,
                  wordSwap: currentMostSignificantWord,
                }));
              }
            } else if (
              currentMostSignificantWord !== firstValues.mostSignificantWord
            ) {
              results.mostSignificantWord = false;
            }
          }

          const currentMostSignificantByte = form["modbus:mostSignificantByte"];
          if (currentMostSignificantByte !== undefined) {
            if (!foundAny.mostSignificantByte) {
              firstValues.mostSignificantByte = currentMostSignificantByte;
              foundAny.mostSignificantByte = true;

              if (endianness.byteSwap !== currentMostSignificantByte) {
                setEndianness((prev) => ({
                  ...prev,
                  byteSwap: currentMostSignificantByte,
                }));
              }
            } else if (
              currentMostSignificantByte !== firstValues.mostSignificantByte
            ) {
              results.mostSignificantByte = false;
            }
          }
        }
      }
    }

    return results;
  }, [td.properties, props.isBaseModbus, unitId, addressOffset, endianness]);

  return (
    <>
      <div className="grid grid-cols-12 gap-1 rounded-t-md bg-gray-600 px-2">
        <div className="col-span-12 rounded-md bg-gray-600 px-2">
          {props.isBaseModbus ? (
            <h1 className="py-1 text-xl text-white">Group Controls</h1>
          ) : (
            <div></div>
          )}
        </div>
        <div
          id="unitId"
          className={`col-span-4 px-2 ${
            validateModbusProperties.unitID ? "h-16" : "h-full"
          }`}
        >
          {validateModbusProperties.unitID ? (
            <SingleIncrementButton
              idIcon="unitId"
              textLabel="Unit ID"
              onUpdateIncrement={handleUnitIdUpdate}
              inferiorLimit={0}
              superiorLimit={255}
              tooltip={getUniIdTooltipContent()}
              valueButton={unitId}
            />
          ) : (
            <>
              <div className="flex h-full flex-col">
                <div className="flex-grow">
                  <SingleIncrementButton
                    idIcon="unitId"
                    textLabel="Unit ID"
                    onUpdateIncrement={handleUnitIdUpdate}
                    inferiorLimit={0}
                    superiorLimit={255}
                    tooltip={getUniIdTooltipContent()}
                    valueButton={unitId}
                  />
                </div>
                <div className="rounded-md p-1 text-center">
                  <h1 className="rounded-md border-2 border-red-500 p-1 font-bold text-red-600">
                    Different unit id is detected on different affordances.
                    Clicking + or - will set all to the same value
                  </h1>
                </div>
              </div>
            </>
          )}
        </div>
        <div
          id="addressOffset"
          className={`col-span-4 px-2 ${
            validateModbusProperties.zeroBasedAddressing ? "h-16" : "h-full"
          }`}
        >
          {validateModbusProperties.zeroBasedAddressing ? (
            <SingleSwapButton
              idIcon="addressOffset"
              tooltip={getAddressOffsetTooltipContent()}
              textLabel="Address Offset"
              valueButton={addressOffset}
              onUpdateIncrement={() =>
                handleAddressOffsetUpdate(!addressOffset)
              }
            />
          ) : (
            <>
              <div className="flex h-full flex-col">
                <div className="flex-grow">
                  <SingleSwapButton
                    idIcon="addressOffset"
                    tooltip={getAddressOffsetTooltipContent()}
                    textLabel="Address Offset"
                    valueButton={addressOffset}
                    onUpdateIncrement={() =>
                      handleAddressOffsetUpdate(!addressOffset)
                    }
                  />
                </div>

                <div className="rounded-md p-1 text-center">
                  <h1 className="rounded-md border-2 border-red-500 p-1 font-bold text-red-600">
                    Different address offset is detected on different
                    affordances. Clicking to swap and set all to the same value
                  </h1>
                </div>
              </div>
            </>
          )}
        </div>

        <div
          id="endianness"
          className={`col-span-4 px-2 ${
            validateModbusProperties.mostSignificantByte &&
            validateModbusProperties.mostSignificantWord
              ? "h-16"
              : "h-full"
          }`}
        >
          {validateModbusProperties.mostSignificantByte &&
          validateModbusProperties.mostSignificantWord ? (
            <DoubleSwapButton
              idIcon="endianness"
              tooltip={getEndiannessTooltipContent()}
              textLabel="Endianness"
              firstDescription="wordswap"
              firstValue={endianness.wordSwap}
              firsthandleOnClick={(newValue, key) =>
                handleEndiannessUpdate(!endianness.wordSwap, "wordSwap")
              }
              secondDescription="byteswap"
              secondValue={endianness.byteSwap}
              secondhandleOnClick={() =>
                handleEndiannessUpdate(!endianness.byteSwap, "byteSwap")
              }
            />
          ) : (
            <>
              <div className="col-span-12">
                <DoubleSwapButton
                  idIcon="endianness"
                  tooltip={getEndiannessTooltipContent()}
                  textLabel="Endianness"
                  firstDescription="wordswap"
                  firstValue={endianness.wordSwap}
                  firsthandleOnClick={(newValue, key) =>
                    handleEndiannessUpdate(!endianness.wordSwap, "wordSwap")
                  }
                  secondDescription="byteswap"
                  secondValue={endianness.byteSwap}
                  secondhandleOnClick={() =>
                    handleEndiannessUpdate(!endianness.byteSwap, "byteSwap")
                  }
                />
              </div>
              <div className="col-span-12 p-1">
                <div className="rounded-md text-center">
                  <h1 className="rounded-md border-2 border-red-500 p-1 font-bold text-red-600">
                    Different endianness (
                    {[
                      !validateModbusProperties.mostSignificantWord &&
                        "wordSwap",
                      !validateModbusProperties.mostSignificantByte &&
                        "byteSwap",
                    ]
                      .filter(Boolean)
                      .join(" and ")}
                    ) is detected on different affordances. Clicking to swap and
                    set all to the same value
                  </h1>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default EditProperties;
