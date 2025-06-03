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
import DialogTextField from "./base/DialogTextField";
import DialogButton from "./base/DialogButton";
import { Check, AlertTriangle } from "react-feather";

export interface IContributeToCatalogProps {
  openModal: () => void;
  close: () => void;
}

const ContributeToCatalog = forwardRef((props, ref) => {
  const context = useContext(ediTDorContext);
  const td: IThingDescription = context.parsedTD;

  const [display, setDisplay] = React.useState<boolean>(false);
  const [isValid, setIsValid] = React.useState<boolean>(false);

  const [model, setModel] = React.useState<string>("");
  const [author, setAuthor] = React.useState<string>("");
  const [manufacturer, setManufacturer] = React.useState<string>("");
  const [license, setLicense] = React.useState<string>("");
  const [copyrightYear, setCopyrightYear] = React.useState<string>("");
  const [holder, setHolder] = React.useState<string>("");
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  useImperativeHandle(ref, () => {
    return {
      openModal: () => open(),
      close: () => close(),
    };
  });

  const open = () => {
    setModel(td["schema:mpn"] ?? "");
    setAuthor(td["schema:author"]?.["schema:name"] ?? "");
    setManufacturer(td["schema:manufacturer"]?.["schema:name"] ?? "");
    setLicense(td["schema:license"] ?? "");
    setCopyrightYear(td["schema:copyrightYear"] ?? "");
    setHolder(
      `${td["schema:copyrightHolder"]?.["@type"] || ""} ${
        td["schema:copyrightHolder"]?.["name"] || ""
      }`.trim()
    );

    setDisplay(true);
  };

  const close = () => {
    setModel("");
    setAuthor("");
    setManufacturer("");
    setLicense("");
    setCopyrightYear("");
    setHolder("");
    setErrorMessage("");
    setDisplay(false);
  };

  const onClickSubmit = () => {
    console.log("Submit clicked");
  };

  const onClickCatalogValidation = () => {
    const isValid = false;
    if (!isValid) {
      setErrorMessage("Catalog validation failed. Please check your input against the JSON Schema at https://github.com/wot-oss/tmc/blob/main/internal/commands/validate/tmc-mandatory.schema.json");
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
            placeholder="The Manufacturer Part Number (MPN) of the product, or the product to which the offer refers."
            id="model"
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            autoFocus={true}
          />
          <DialogTextField
            label="Author*"
            placeholder="The organization writing the TM"
            id="author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            autoFocus={false}
          />
          <DialogTextField
            label="Manufacturer*"
            placeholder="Manufacturer of the device"
            id="manufacturer"
            type="text"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            autoFocus={false}
          />
          <DialogTextField
            label="License"
            placeholder="URL of the license, e.g., https://www.apache.org/licenses/LICENSE-2.0.txt"
            id="license"
            type="text"
            value={license}
            onChange={(e) => setLicense(e.target.value)}
            autoFocus={false}
          />
          <DialogTextField
            label="Copyright Year"
            placeholder="e.g. 2024..."
            id="copyright"
            type="text"
            value={copyrightYear}
            onChange={(e) => setCopyrightYear(e.target.value)}
            autoFocus={false}
          />
          <DialogTextField
            label="Copyright Holder"
            placeholder="Organization holding the copyright of the TM..."
            id="holder"
            type="text"
            value={holder}
            onChange={(e) => setHolder(e.target.value)}
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
              <div className="ml-2 mt-2 inline h-full w-full rounded bg-red-500 p-2 text-white">
                <AlertTriangle size={16} className="mr-1 inline" />
                {errorMessage}
              </div>
            )}
            {isValid && (
              <div className="ml-2 mt-2 inline h-10 rounded bg-green-500 p-2 text-white">
                <Check size={16} className="mr-1 inline" />
                {"TM is valid"}
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
          <div className="my-4">
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

export default ContributeToCatalog;
