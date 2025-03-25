/********************************************************************************
 * Copyright (c) 2018 - 2022 Contributors to the Eclipse Foundation
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
import React, { forwardRef, useContext, useImperativeHandle } from "react";
import ReactDOM from "react-dom";
import { ChevronDown } from "react-feather";
import ediTDorContext from "../../context/ediTDorContext";
import { DialogTemplate } from "./DialogTemplate";
import { readFromFile } from "../../services/fileTdService";
import { parseCsv, mapCsvToProperties } from "../../utils/parser";

export const CreateTdDialog = forwardRef((props, ref) => {
  const context = useContext(ediTDorContext);
  const [display, setDisplay] = React.useState(() => {
    return false;
  });
  const [type, setType] = React.useState("TD"); // either TD or TM
  const [properties, setProperties] = React.useState({});
  const [fileName, setFileName] = React.useState("");

  const openCsvFile = async () => {
    try {
      const res = await readFromFile();

      if (res.fileName.includes(".csv")) {
        setFileName(res.fileName);
        const data = parseCsv(res.td, true, ",");
        const parsedProperties = mapCsvToProperties(data);
        setProperties(parsedProperties);
      } else {
        throw new Error("Invalid file type. Only CSV files are supported.");
      }
    } catch (error) {
      const msg = "Opening a new TD was canceled or an error occurred.";
      console.error(msg, error);
      alert(msg);
    }
  };

  useImperativeHandle(ref, () => {
    return {
      openModal: () => open(),
      close: () => close(),
    };
  });

  const open = () => {
    setDisplay(true);
  };

  const close = () => {
    setDisplay(false);
  };

  const changeType = (e) => {
    setType(e.target.value);
  };

  const getType = () => {
    return type;
  };

  const content = buildForm(
    context,
    changeType,
    getType,
    openCsvFile,
    fileName
  );

  if (display) {
    return ReactDOM.createPortal(
      <DialogTemplate
        onCancel={close}
        onSubmit={() => {
          let td = createNewTD(type, properties);
          let linkedTd = {};
          linkedTd[td["title"]] = td;
          context.updateLinkedTd(undefined);
          context.addLinkedTd(linkedTd);
          context.updateOfflineTD(JSON.stringify(td, null, "\t"));
          close();
        }}
        children={content}
        submitText={type === "TD" ? "Create TD" : "Create TM"}
        title={"Create a New TD/TM"}
        description={
          "To quickly create a basis for your new Thing Description/Thing Model just fill out this little template and we'll get you going."
        }
      />,
      document.getElementById("modal-root")
    );
  }

  return null;
});

const buildForm = (context, changeType, getType, openCsvFile, fileName) => {
  return (
    <>
      <label htmlFor="type" className="text-sm text-gray-400 font-medium pl-2">
        Type:
      </label>
      <div className="relative">
        <select
          className="block appearance-none w-full bg-gray-600 border-2 border-gray-600 text-white py-3 px-4 pr-8 rounded leading-tight focus:border-blue-500 focus:outline-none"
          id="type"
          onChange={changeType}
          value={getType()}
        >
          <option value="TD">Thing Description</option>
          <option value="TM">Thing Model</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <ChevronDown color="#cacaca"></ChevronDown>
        </div>
      </div>
      {formField("ID", "urn:thing-id", "thing-id", "url", "autoFocus")}
      {formField("Title", "Thing Title", "thing-title", "text")}
      {formField(
        "Base",
        "http://www.example.com/thing-path",
        "thing-base",
        "url"
      )}
      <label
        htmlFor="thing-description"
        className="text-sm text-gray-400 font-medium pl-2"
      >
        Description:
      </label>
      <textarea
        id="thing-description"
        rows="5"
        className="bg-gray-600
                sm:text-sm
                appearance-none
                border-2 border-gray-600 rounded w-full
                p-2
                text-white
                leading-tight
                focus:outline-none
                focus:border-blue-500"
        placeholder="A short description about this new Thing..."
      />
      <label
        htmlFor="thing-security"
        className="text-sm text-gray-400 font-medium pl-2"
      >
        Security:
      </label>
      <div className="relative mb-8">
        <select
          className="block appearance-none w-full bg-gray-600 border-2 border-gray-600 text-white py-3 px-4 pr-8 rounded leading-tight focus:border-blue-500 focus:outline-none"
          id="thing-security"
        >
          <option>nosec</option>
          <option>basic</option>
          <option>digest</option>
          <option>bearer</option>
          <option>psk</option>
          <option>oauth2</option>
          <option>apikey</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <ChevronDown color="#cacaca"></ChevronDown>
        </div>
      </div>
      <div>
        <label
          htmlFor="submit-csv"
          className="text-sm text-gray-400 font-medium pl-2"
        >
          Add properties in CSV format:
        </label>
      </div>
      <div className="border-gray-600 border-2 rounded">
        <div className="flex items-center justify-evenly ml-2 mr-2">
          <button
            id="submit-csv"
            className="border-2 border-gray-600 rounded w-1/3
                p-2
                text-white
                leading-tight
                focus:outline-none
                focus:border-blue-500
				        bg-blue-500
                "
            onClick={() => openCsvFile()}
          >
            Load a CSV File
          </button>
          <div className="w-full">
            <p className="pl-2">{fileName || "No file selected"}</p>
          </div>

          <div className="flex items-center p-2 w-full">
            <label
              htmlFor="protocol-option"
              className="text-2xl text-gray-400 pl-2 pr-2"
            >
              Protocol:
            </label>
            <div className="relative w-10">
              <select
                className=" block appearance-none bg-gray-600 border-2 border-gray-600 text-white py-3 px-4 pr-8 rounded leading-tight focus:border-blue-500 focus:outline-none"
                id="protocol-option"
              >
                <option>Modbus TCP</option>
                <option>Modbus RTU</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown color="#cacaca"></ChevronDown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const formField = (label, placeholder, id, type, autoFocus) => {
  return (
    <div key={id} className="py-1">
      <label htmlFor={id} className="text-sm text-gray-400 font-medium pl-2">
        {label}:
      </label>
      <input
        name={id}
        id={id}
        className="border-gray-600 bg-gray-600 w-full p-2 sm:text-sm border-2 text-white rounded-md focus:outline-none focus:border-blue-500"
        placeholder={placeholder}
        type={type}
        autoFocus={autoFocus === "autoFocus"}
      />
    </div>
  );
};

const createNewTD = (type, properties) => {
  let id = document.getElementById("thing-id").value;
  let title = document.getElementById("thing-title").value;
  let base = document.getElementById("thing-base").value;

  let tdDescription = document.getElementById("thing-description").value;
  let tdSecurity = document.getElementById("thing-security").value;

  var thing = {};

  thing["@context"] = "https://www.w3.org/2019/wot/td/v1";
  thing["title"] = title !== "" ? title : "ediTDor Thing";

  if (type === "TM") {
    thing["@type"] = "tm:ThingModel";
  }

  if (id !== "") {
    thing["id"] = id !== "" ? id : "urn:editdor-thing-id";
  }

  if (base !== "") {
    thing["base"] = base !== "" ? base : "/";
  }

  if (tdDescription !== "") {
    thing["description"] = tdDescription;
  }

  let securityDefinitions = {};
  securityDefinitions[`${tdSecurity}_sc`] = { scheme: tdSecurity };

  thing["securityDefinitions"] = securityDefinitions;
  thing["security"] = `${tdSecurity}_sc`;

  thing["properties"] = properties;
  thing["actions"] = {};
  thing["events"] = {};

  return thing;
};
