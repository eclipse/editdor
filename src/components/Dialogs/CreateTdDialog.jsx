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
import { parseCsv, mapCsvToProperties } from "../../utils/parser";

export const CreateTdDialog = forwardRef((props, ref) => {
  const context = useContext(ediTDorContext);
  const [display, setDisplay] = React.useState(() => {
    return false;
  });
  const [type, setType] = React.useState("TD"); // either TD or TM
  const [properties, setProperties] = React.useState({});
  const [fileName, setFileName] = React.useState("");
  const [protocol, setProtocol] = React.useState("Modbus TCP");
  const fileInputRef = React.useRef(null);

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
    setFileName("");
    setProtocol("Modbus TCP");
    setProperties({});
    setDisplay(false);
  };

  const changeType = (e) => {
    setType(e.target.value);
  };

  const content = buildForm(
    changeType,
    type,
    protocol,
    setProtocol,
    fileName,
    setFileName,
    fileInputRef,
    setProperties
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
          context.updateOfflineTD(JSON.stringify(td, null, 2));
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

const buildForm = (
  changeType,
  type,
  protocol,
  setProtocol,
  fileName,
  setFileName,
  fileInputRef,
  setProperties
) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvContent = e.target.result;
        const data = parseCsv(csvContent, true, ",");
        let parsedProperties = {};
        try {
          parsedProperties = mapCsvToProperties(data);
          if (Object.keys(parsedProperties).length === 0) {
            throw new Error("No valid properties found in the CSV file.");
          }
        } catch (error) {
          alert(error.message);
        }
        setProperties(parsedProperties);
      };

      reader.onerror = (e) => {
        alert("Reading file:", e.target.error);
      };

      reader.readAsText(file);
    }
  };

  const handleButtonClick = () => {
    if (!fileInputRef.current) {
      return;
    }
    fileInputRef.current.click();
  };

  const downloadCsvTemplate = () => {
    const csvContent = `name,title,description,type,minimum,maximum,unit,href,modbus:unitID,modbus:address,modbus:quantity,modbus:type,modbus:zeroBasedAddressing,modbus:entity,modbus:pollingTime,modbus:function,modbus:mostSignificantByte,modbus:mostSignificantWord,modbus:timeout`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "modbus_tcp_properties_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <label htmlFor="type" className="pl-2 text-sm font-medium text-gray-400">
        Type:
      </label>
      <div className="relative">
        <select
          className="block w-full appearance-none rounded border-2 border-gray-600 bg-gray-600 px-4 py-3 pr-8 leading-tight text-white focus:border-blue-500 focus:outline-none"
          id="type"
          onChange={changeType}
          value={type}
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
        className="pl-2 text-sm font-medium text-gray-400"
      >
        Description:
      </label>
      <textarea
        id="thing-description"
        rows="5"
        className="w-full appearance-none rounded border-2 border-gray-600 bg-gray-600 p-2 leading-tight text-white focus:border-blue-500 focus:outline-none sm:text-sm"
        placeholder="A short description about this new Thing..."
      />
      <label
        htmlFor="thing-security"
        className="pl-2 text-sm font-medium text-gray-400"
      >
        Security:
      </label>
      <div className="relative mb-8">
        <select
          className="block w-full appearance-none rounded border-2 border-gray-600 bg-gray-600 px-4 py-3 pr-8 leading-tight text-white focus:border-blue-500 focus:outline-none"
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
      <div className="pt-2">
        <label
          htmlFor="submit-csv"
          className="pl-2 text-sm font-medium text-gray-400"
        >
          Add properties in CSV format:
        </label>
      </div>

      <div className="flex justify-between rounded border-2 border-gray-600">
        <div className="flex justify-between">
          <div className="flex items-center p-2">
            <label
              htmlFor="protocol-option"
              className="pl-2 pr-2 text-lg text-gray-400"
            >
              Protocol:
            </label>

            <div className="relative">
              <select
                id="protocol-option"
                className="block appearance-none rounded border-2 border-gray-600 bg-gray-600 px-4 py-2 pr-8 leading-tight text-white focus:border-blue-500 focus:outline-none"
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
              >
                <option>Modbus TCP</option>
                <option disabled>
                  More protocols will be supported in the future
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown color="#cacaca"></ChevronDown>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <button
              id="download-template"
              className="rounded border-2 border-gray-600 bg-blue-500 p-2 leading-tight text-white focus:border-blue-500 focus:outline-none"
              onClick={downloadCsvTemplate}
            >
              Download CSV Template
            </button>
          </div>
        </div>

        <div className="ml-2 mr-2 flex items-center">
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <button
            id="submit-csv"
            className="rounded border-2 border-gray-600 bg-blue-500 p-2 leading-tight text-white focus:border-blue-500 focus:outline-none"
            onClick={handleButtonClick}
          >
            Load a CSV File
          </button>
          <div className="">
            <p className="pl-2">{fileName || "No file selected"}</p>
          </div>
        </div>
      </div>
    </>
  );
};

const formField = (label, placeholder, id, type, autoFocus) => {
  return (
    <div key={id} className="py-1">
      <label htmlFor={id} className="pl-2 text-sm font-medium text-gray-400">
        {label}:
      </label>
      <input
        name={id}
        id={id}
        className="w-full rounded-md border-2 border-gray-600 bg-gray-600 p-2 text-white focus:border-blue-500 focus:outline-none sm:text-sm"
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
