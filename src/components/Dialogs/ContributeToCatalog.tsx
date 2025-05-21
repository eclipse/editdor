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
import React, { forwardRef, useContext, useImperativeHandle } from "react";
import ReactDOM from "react-dom";
import { ChevronDown } from "react-feather";
import ediTDorContext from "../../context/ediTDorContext";
import DialogTemplate from "./DialogTemplate";
import FormField from "./base/FormField";
import DialogTextField from "./base/DialogTextField";
import DialogButton from "./base/DialogButton";
import DialogDropdown from "./base/DialogDropdown";
import DialogTextArea from "./base/DialogTextArea";
import { Eye, Check, Info, CheckCircle, AlertTriangle } from "react-feather";

export interface IContributeToCatalogProps {
  openModal: () => void;
  close: () => void;
}

const ContributeToCatalog = forwardRef((props, ref) => {
  const context = useContext(ediTDorContext);
  const [display, setDisplay] = React.useState<boolean>(false);
  const [isValid, setIsValid] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string>("");

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
    setErrorMessage("");
  };

  const onClickSubmit = () => {
    console.log("Submit clicked");
  };

  const onClickCatalogValidation = () => {
    const isValid = false;
    if (!isValid) {
      setErrorMessage("Catalog validation failed. Please check your input.");
    } else {
      setErrorMessage("");
    }
  };

  const content = (
    <>
      <div className="rounded-md bg-black bg-opacity-80 p-2">
        <h1 className="font-bold">
          Add fields for Cataloging to ensure quality and discoverability of
          Things Models
        </h1>
        <div className="px-4">
          <DialogTextField
            label="Model*"
            placeholder="Model Number, e.g. ABC-DEF-123..."
            id="model"
            type="text"
            autoFocus={true}
          />
          <DialogTextField
            label="Author*"
            placeholder="The organization writing the TM"
            id="author"
            type="text"
            autoFocus={false}
          />
          <DialogTextField
            label="Manufacturer*"
            placeholder="Manufacturer of the hardware"
            id="manufacturer"
            type="text"
            autoFocus={false}
          />
          <DialogTextField
            label="License"
            placeholder="URL the license..."
            id="license"
            type="text"
            autoFocus={false}
          />
          <DialogTextField
            label="Copyright Year"
            placeholder="e.g. 2024..."
            id="copyright"
            type="text"
            autoFocus={false}
          />
          <DialogTextField
            label="Holder"
            placeholder="Organization holding the copyright of the TM..."
            id="holder"
            type="text"
            autoFocus={false}
          />
          <div className="flex">
            <DialogButton
              id="catalogValidation"
              text="Catalog Valitation"
              className="my-2"
              onClick={onClickCatalogValidation}
            ></DialogButton>
            {errorMessage && (
              <div className="ml-2 mt-2 inline h-10 rounded bg-red-500 p-2 text-white">
                <AlertTriangle size={16} className="mr-1 inline" />
                {errorMessage}
              </div>
            )}
            {isValid && (
              <div className="ml-2 mt-2 inline h-10 rounded bg-green-500 p-2 text-white">
                <Check size={16} className="mr-1 inline" />
                {"Catalog is valid"}
              </div>
            )}
          </div>
        </div>
      </div>
      <div>
        <div className="my-4 rounded-md bg-black bg-opacity-80 p-2">
          <DialogTextField
            label="TM Catalog Endpoint:"
            placeholder="TM Catalog Endpoint:..."
            id="catalogEndpoint"
            type="text"
            autoFocus={false}
          />
        </div>
        <div className="my-4 rounded-md bg-black bg-opacity-80 p-2">
          <h1>Report</h1>
          <DialogButton
            id="reportCurrentvalues"
            text="Use Current values"
            className="m-2"
            onClick={() => {
              console.log("2");
            }}
          ></DialogButton>
          <DialogButton
            id="uploadReport"
            text="Upload Report"
            className="m-2"
            onClick={() => {
              console.log("3");
            }}
          ></DialogButton>
          <div className="my-4">
            <h1>Catalog Type</h1>
            <DialogDropdown
              id="catalogType"
              label="Choose an option"
              className="pl-2"
              options={["HTTP", "ModBus"]}
            ></DialogDropdown>
            <DialogButton
              id="authenticate"
              text="Authenticate"
              className="m-2"
              onClick={() => {
                console.log("4");
              }}
            ></DialogButton>
            <DialogButton
              id="submit"
              text="submit (?)"
              className="m-2"
              onClick={() => {
                console.log("5");
              }}
            ></DialogButton>
          </div>
        </div>
      </div>
    </>
  );

  if (display) {
    return ReactDOM.createPortal(
      <DialogTemplate
        onCancel={close}
        onSubmit={onClickSubmit}
        children={content}
        submitText="Submit"
        cancelText="Cancel"
        title={"Contribute to the Catalog with your TM"}
        description={
          "Fullfil the form below to contribute your TM to the Catalog."
        }
      />,
      document.getElementById("modal-root") as HTMLElement
    );
  }

  return null;
});

const buildForm = (
  changeType: (e: React.ChangeEvent<HTMLSelectElement>) => void,
  type: "TD" | "TM",
  protocol: string,
  setProtocol: React.Dispatch<React.SetStateAction<string>>,
  fileName: string,
  setFileName: React.Dispatch<React.SetStateAction<string>>,
  fileInputRef: React.RefObject<HTMLInputElement>,
  setProperties: React.Dispatch<React.SetStateAction<Record<string, any>>>
) => {
  const handleFileChange = (event) => {
    /*
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvContent = e.target?.result as string;
        const data = parseCsv(csvContent, true, ",");
        let parsedProperties = {};
        try {
          parsedProperties = mapCsvToProperties(data);
          if (Object.keys(parsedProperties).length === 0) {
            throw new Error("No valid properties found in the CSV file.");
          }
        } catch (error) {
          alert((error as Error).message);
        }
        setProperties(parsedProperties);
      };

      reader.onerror = (e) => {
        alert(`Reading file: ${e.target?.error}`);
      };

      reader.readAsText(file);
    }
      */
  };

  const handleButtonClick = (): void => {
    /*
    if (!fileInputRef.current) {
      return;
    }
    fileInputRef.current.click();
  */
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

      <label
        htmlFor="thing-description"
        className="pl-2 text-sm font-medium text-gray-400"
      >
        Description:
      </label>
      <textarea
        id="thing-description"
        rows={5}
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
              onClick={() => {
                console.log("Adf");
              }}
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

export default ContributeToCatalog;
