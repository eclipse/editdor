/********************************************************************************
 * Copyright (c) 2018 Contributors to the Eclipse Foundation
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
import PropTypes from "prop-types";
import ediTDorContext from "../../../context/ediTDorContext";
import ButtonSwap from "../base/ButtonSwap";
import IncrementButton from "../base/IncrementButton";
import { IThingDescription } from "types/td";
import InfoIconWrapper from "../../InfoIcon/InfoIconWrapper";
import {
  getAddressOffsetTooltipContent,
  getEndiannessTooltipContent,
  getUniIdTooltipContent,
} from "../../InfoIcon/InfoTooltips";

interface IEndianness {
  wordSwap: boolean;
  byteSwap: boolean;
}

interface IEditPropertiesProps {
  isBaseModbus: boolean;
}

const EditProperties: React.FC<IEditPropertiesProps> = (isBaseModbus) => {
  const context = useContext(ediTDorContext);
  const td: IThingDescription = JSON.parse(context.offlineTD);
  const [unitId, setUnitId] = useState<number>(255);
  const [addressOffset, setAddressOffset] = useState<boolean>(true);
  const [endianness, setEndianness] = useState<IEndianness>({
    wordSwap: true,
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
            isBaseModbus ||
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

  const AddressOffset = (
    <>
      <div className="col-span-4 grid h-full w-full grid-cols-12 gap-1 rounded-lg bg-white">
        <div className="col-span-6 flex items-center justify-center rounded-l-lg bg-blue-500">
          <InfoIconWrapper
            tooltip={getAddressOffsetTooltipContent()}
            id="addressOffset"
          >
            <h1 className="p-2 font-bold text-white">Address Offset</h1>
          </InfoIconWrapper>
        </div>
        <div className="col-span-6 rounded-r-lg bg-blue-500">
          <div className="grid h-full w-full grid-cols-12">
            <div className="col-span-12"></div>
            <div className="col-span-12">
              <div className="grid h-full w-full grid-cols-12">
                <div id="firstRow" className="col-span-12 bg-blue-500">
                  <ButtonSwap
                    description=""
                    value={addressOffset}
                    onClick={() => handleAddressOffsetUpdate(!addressOffset)}
                  />
                </div>
              </div>
            </div>
            <div className="col-span-12"></div>
          </div>
        </div>
      </div>
    </>
  );

  const Endianess = (
    <>
      <div className="col-span-4 grid h-full w-full grid-cols-12 gap-1 rounded-lg bg-white">
        <div className="col-span-4 flex items-center justify-center rounded-l-lg bg-blue-500">
          <InfoIconWrapper
            tooltip={getEndiannessTooltipContent()}
            id="endianess"
          >
            <h1 className="p-2 font-bold text-white">Endianess</h1>
          </InfoIconWrapper>
        </div>
        <div className="col-span-8 rounded-r-lg">
          <div className="grid h-full w-full grid-cols-12">
            <div id="firstRow" className="col-span-12 bg-blue-500">
              <ButtonSwap
                description="wordswap"
                value={endianness.wordSwap}
                onClick={() =>
                  handleEndiannessUpdate(!endianness.wordSwap, "wordSwap")
                }
              />
            </div>
            <div id="secondRow" className="col-span-12 bg-blue-500">
              <ButtonSwap
                description="byteswap"
                value={endianness.byteSwap}
                onClick={() =>
                  handleEndiannessUpdate(!endianness.byteSwap, "byteSwap")
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const UnidId = (
    <>
      <div className="col-span-4 grid h-full w-full grid-cols-12 gap-1 rounded-lg bg-white">
        <div className="col-span-6 flex items-center justify-center rounded-l-lg bg-blue-500">
          <InfoIconWrapper tooltip={getUniIdTooltipContent()} id="unitId">
            <h1 className="p-2 font-bold text-white">Unit ID</h1>
          </InfoIconWrapper>
        </div>
        <div className="col-span-6 rounded-r-lg bg-blue-500">
          <div className="grid h-full w-full grid-cols-12">
            <div className="col-span-12"></div>
            <div className="col-span-12">
              <div className="grid h-full w-full grid-cols-12">
                <div id="firstRow" className="col-span-12 bg-blue-500">
                  <IncrementButton
                    value={unitId}
                    onUpdate={handleUnitIdUpdate}
                  ></IncrementButton>
                </div>
              </div>
            </div>
            <div className="col-span-12"></div>
          </div>
        </div>
      </div>
    </>
  );
  return (
    <>
      <div className="grid grid-cols-12 gap-1">
        <div
          id="unitId"
          className="col-span-4 h-full rounded-lg bg-gray-600 px-2"
        >
          {UnidId}
        </div>

        <div
          id="addressOffset"
          className="col-span-4 h-full rounded-lg bg-gray-600 px-2"
        >
          {AddressOffset}
        </div>
        <div
          id="endianess"
          className="col-span-4 h-full rounded-lg bg-gray-600 px-2"
        >
          {Endianess}
        </div>
      </div>
    </>
  );
};

EditProperties.propTypes = {
  isBaseModbus: PropTypes.bool.isRequired,
};

export default EditProperties;
