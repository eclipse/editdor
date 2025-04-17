/********************************************************************************
 * Copyright (c) 2018 - 2025 Contributors to the Eclipse Foundation
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
import { IForm, IModbusForm, IThingDescription } from "types/td";

interface IEndianness {
  wordSwap: boolean;
  byteSwap: boolean;
}

interface IEditPropertiesProps {
  isBaseModbus: boolean;
}

const EditProperties: React.FC<IEditPropertiesProps> = (isBaseModbus) => {
  const context = useContext(ediTDorContext);
  const td: IThingDescription = context.parsedTD;
  const [unitId, setUnitId] = useState<number>(255);
  const [addressOffset, setAddressOffset] = useState<boolean>(true);
  const [endianness, setEndianness] = useState<IEndianness>({ wordSwap: true, byteSwap: false });

  const handleUnitIdUpdate = (newValue: number) => {
    setUnitId(newValue);

    if (!td.properties) {
      return;
    }

    const updateModbusUnitId = (forms: IModbusForm[]) => {
      forms.forEach((form) => {
        if (form.href.startsWith("modbus://") || form.href.startsWith("modbus+tcp://") || isBaseModbus) {
          form["modbus:unitID"] = newValue;
        }
      });
    };

    Object.values(td.properties).forEach((property) => {
      if (property.forms) {
        updateModbusUnitId(property.forms);
      }
    });

    context.updateOfflineTD(JSON.stringify(td, null, 2));
  };

  const handleAddressOffsetUpdate = (newValue: boolean) => {
    setAddressOffset(newValue);
    if (!td.properties) {
      return;
    }
    const updateModbusAddressOffset = (forms: IModbusForm[]) => {
      forms.forEach((form) => {
        if (form.href.startsWith("modbus://") || form.href.startsWith("modbus+tcp://") || isBaseModbus) {
          form["modbus:zeroBasedAddressing"] = newValue;
        }
      });
    };
    Object.values(td.properties).forEach((property) => {
      if (property.forms) {
        updateModbusAddressOffset(property.forms);
      }
    });
    context.updateOfflineTD(JSON.stringify(td, null, 2));
  };

  const handleEndiannessUpdate = (newValue: boolean, type: string) => {
    if (type === "wordSwap") {
      setEndianness((prev) => ({ ...prev, wordSwap: newValue }));
    }
    if (type === "byteSwap") {
      setEndianness((prev) => ({ ...prev, byteSwap: newValue }));
    }
    if (!td.properties) {
      return;
    }
    const updateModbusEndianness = (forms: IModbusForm[]) => {
      forms.forEach((form) => {
        if (form.href.startsWith("modbus://") || form.href.startsWith("modbus+tcp://") || isBaseModbus) {
          if (type === "wordSwap") {
            form["modbus:mostSignificantWord"] = newValue;
          } else if (type === "byteSwap") {
            form["modbus:mostSignificantByte"] = newValue;
          }
        }
      });
    };
    Object.values(td.properties).forEach((property) => {
      if (property.forms) {
        updateModbusEndianness(property.forms);
      }
    });
    context.updateOfflineTD(JSON.stringify(td, null, 2));
  };

  const AddressOffset = (
    <>
      <div className="col-span-4 grid h-full w-full grid-cols-12 gap-1 rounded-lg bg-white">
        <div className="col-span-6 rounded-l-lg bg-blue-500">
          <div className="grid h-full w-full grid-cols-12 p-2">
            <div className="col-span-12 text-center font-bold text-white">Address Offset</div>
            <div className="col-span-12 text-center text-white">
              Should all addresses shift by one (false) or not (true){" "}
            </div>
          </div>
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
        <div className="col-span-6 rounded-l-lg bg-blue-500">
          <div className="grid h-full w-full grid-cols-12 p-2">
            <div className="col-span-12 text-center font-bold text-white">Endianess</div>
            <div className="col-span-12 text-center text-white">Should the words or bytes be swapped</div>
          </div>
        </div>
        <div className="col-span-6 rounded-r-lg">
          <div className="grid h-full w-full grid-cols-12">
            <div id="firstRow" className="col-span-12 bg-blue-500">
              <ButtonSwap
                description="wordswap"
                value={endianness.wordSwap}
                onClick={() => handleEndiannessUpdate(!endianness.wordSwap, "wordSwap")}
              />
            </div>
            <div id="secondRow" className="col-span-12 bg-blue-500">
              <ButtonSwap
                description="byteswap"
                value={endianness.byteSwap}
                onClick={() => handleEndiannessUpdate(!endianness.byteSwap, "byteSwap")}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const UnidId = (
    <>
      <div className="col-span-4 grid w-full grid-cols-12 gap-1 rounded-lg bg-white">
        <div className="col-span-6 rounded-l-lg bg-blue-500">
          <div className="grid w-full grid-cols-12 p-2">
            <div className="col-span-12 text-center font-bold text-white">Unit Id</div>
            <div className="col-span-12 text-center text-white">Slave Address of the modbus device</div>
          </div>
        </div>
        <div className="col-span-6 rounded-r-lg bg-blue-500">
          <div className="grid h-full w-full grid-cols-12">
            <IncrementButton value={unitId} onUpdate={handleUnitIdUpdate}></IncrementButton>
          </div>
        </div>
      </div>
    </>
  );
  return (
    <>
      <div className="mb-5 grid grid-cols-12 gap-2">
        <div id="unitId" className="qh-1/3 col-span-4 rounded-lg bg-gray-600 px-2">
          {UnidId}
        </div>

        <div id="addressOffset" className="col-span-4 rounded-lg bg-gray-600 px-2">
          {AddressOffset}
        </div>
        <div id="endianess" className="col-span-4 rounded-lg bg-gray-600 px-2">
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
