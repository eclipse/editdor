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
import React, { forwardRef, useContext, useImperativeHandle } from "react";
import ReactDOM from "react-dom";
import ediTDorContext from "../../context/ediTDorContext";
import DialogTemplate from "./DialogTemplate";
import DialogTextField from "./base/DialogTextField";
import BaseButton from "../TDViewer/base/BaseButton";
import {
  Check,
  AlertTriangle,
  Copy,
  ExternalLink,
  RefreshCw,
} from "react-feather";
import { isValidUrl } from "../../utils/strings";
import Ajv2019 from "ajv/dist/2019";
import addFormats from "ajv-formats";
import draft7MetaSchema from "ajv/dist/refs/json-schema-draft-07.json";
import { requestWeb } from "../../services/thingsApiService";
import { getValidateTMContent } from "./../InfoIcon/TooltipMapper";
import InfoIconWrapper from "./../InfoIcon/InfoIconWrapper";
import type { ThingDescription } from "wot-thing-description-types";

export interface IContributeToCatalogProps {
  openModal: () => void;
  close: () => void;
}

const validationTmcMandatory =
  "https://raw.githubusercontent.com/wot-oss/tmc/main/internal/commands/validate/tmc-mandatory.schema.json";
const validationTmJson =
  "https://raw.githubusercontent.com/wot-oss/tmc/main/internal/commands/validate/tm-json-schema-validation.json";
const validationModbus =
  "https://raw.githubusercontent.com/wot-oss/tmc/refs/heads/main/internal/commands/validate/modbus.schema.json";

const ContributeToCatalog = forwardRef((props, ref) => {
  const validationTmUrl =
    "https://raw.githubusercontent.com/wot-oss/tmc/main/internal/commands/validate/tmc-mandatory.schema.json";

  const context = useContext(ediTDorContext);
  const td: ThingDescription = context.parsedTD;

  const [display, setDisplay] = React.useState<boolean>(false);
  const [isValid, setIsValid] = React.useState<boolean>(false);
  const [isValidating, setIsValidating] = React.useState<boolean>(false);

  const [model, setModel] = React.useState<string>("");
  const [author, setAuthor] = React.useState<string>("");
  const [manufacturer, setManufacturer] = React.useState<string>("");
  const [license, setLicense] = React.useState<string>("");
  const [copyrightYear, setCopyrightYear] = React.useState<string>("");
  const [holder, setHolder] = React.useState<string>("");

  const [tmCatalogEndpoint, setTmCatalogEndpoint] = React.useState<string>("");
  const [repository, setRepository] = React.useState<string>("");

  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [tmCatalogEndpointError, setTmCatalogEndpointError] =
    React.useState<string>("");

  const [repositoryError, setRepositoryError] = React.useState<string>("");

  const [submitted, setSubmitted] = React.useState<boolean>(false);
  const [copied, setCopied] = React.useState<boolean>(false);
  const [link, setLink] = React.useState<string>("");
  const [id, setId] = React.useState<string>("");

  const [submittedError, setSubmittedError] = React.useState<string>("");
  const [tmCopy, setTMCopy] = React.useState<ThingDescription | null>(null);

  useImperativeHandle(ref, () => {
    return {
      openModal: () => open(),
      close: () => close(),
    };
  });

  const open = () => {
    setModel(`${td["schema:mpn"] ?? ""}`);
    setAuthor(td["schema:author"]?.["schema:name"] ?? "");
    setManufacturer(td["schema:manufacturer"]?.["schema:name"] ?? "");
    setLicense(`${td["schema:license"] ?? ""}`);
    setCopyrightYear(`${td["schema:copyrightYear"] ?? ""}`);
    setHolder(`${td["schema:copyrightHolder"]?.["name"] || ""}`.trim());

    const urlParams = new URLSearchParams(window.location.search);

    const tmcEndpointParam = urlParams.get("tmcendpoint");
    const repositoryParam = urlParams.get("repo");

    const decodedTmcEndpoint = tmcEndpointParam
      ? decodeURIComponent(tmcEndpointParam)
      : "";

    const decodedRepository = repositoryParam
      ? decodeURIComponent(repositoryParam)
      : "";

    if (!isValidUrl(decodedTmcEndpoint) && decodedTmcEndpoint !== "") {
      setTmCatalogEndpointError(
        "Please enter a valid URL starting with http:// or https://"
      );
    }

    setTmCatalogEndpoint(decodedTmcEndpoint);
    setRepository(decodedRepository);
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
    setTmCatalogEndpointError("");
    setRepositoryError("");
    setSubmittedError("");
    setSubmitted(false);
    setCopied(false);
    setLink("");
    setId("");
    setTmCatalogEndpoint("");
    setRepository("");
    setIsValidating(false);
    setIsValid(false);
    setDisplay(false);
  };

  const handleSubmit = async () => {
    setSubmittedError("");
    setSubmitted(false);
    try {
      const response = await requestWeb(
        `${tmCatalogEndpoint}/thing-models`,
        "POST",
        JSON.stringify(tmCopy),
        {
          queryParams: {
            repo: repository,
          },
        }
      );

      if (!response) {
        setSubmittedError("Failed to connect to the server");
        return;
      }

      const result = await response.json();

      if (response.status === 201 && result.data) {
        const { tmID, message } = result.data;

        if (tmID) {
          setSubmitted(true);
          setId(tmID);
          setLink(`${tmCatalogEndpoint}/thing-models/${tmID}`);
        } else {
          setSubmittedError("Response missing tmID");
        }
        return;
      }
      const errorMessage = result.detail + " " + result.title;
      setSubmittedError(`Error: ${errorMessage}`);
      return;
    } catch (err) {
      setSubmittedError(
        `Failed to process request: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  const handleCatalogValidation = async () => {
    setErrorMessage("");
    setIsValid(false);
    setIsValidating(true);

    const tdCopy = structuredClone(td);
    tdCopy["schema:mpn"] = model;
    tdCopy["schema:author"] = {
      "schema:name": author,
    };
    tdCopy["schema:manufacturer"] = {
      "@type": "Organization",
      "schema:name": manufacturer,
    };
    tdCopy["schema:license"] = license;
    tdCopy["schema:copyrightYear"] = copyrightYear;
    tdCopy["schema:copyrightHolder"] = {
      "@type": "Organization",
      "schema:name": holder,
    };

    try {
      tdCopy["@context"] = normalizeContext(tdCopy["@context"]);
    } catch (err) {
      setIsValid(false);
      setErrorMessage(
        err instanceof Error ? err.message : "Context normalization error"
      );
      return;
    }

    setTMCopy(tdCopy);

    try {
      const ajv = new Ajv2019({
        strict: false,
        allErrors: true,
        validateFormats: true,
      });
      addFormats(ajv);
      ajv.addMetaSchema(draft7MetaSchema);

      let response = await fetch(validationTmcMandatory);
      if (!response.ok)
        throw new Error(
          `Failed to fetch schema from ${validationTmcMandatory}`
        );
      let schema = await response.json();
      let validate = ajv.compile(schema);
      let valid = validate(tdCopy);
      if (!valid) {
        setIsValid(false);
        setErrorMessage(
          `Validation failed for ${validationTmcMandatory}: ${
            validate.errors ? ajv.errorsText(validate.errors) : ""
          }`
        );
        return;
      }

      response = await fetch(validationTmJson);
      if (!response.ok)
        throw new Error(`Failed to fetch schema from ${validationTmJson}`);
      let schemaTmJson = await response.json();
      ajv.addSchema(schemaTmJson);

      response = await fetch(validationModbus);
      if (!response.ok)
        throw new Error(`Failed to fetch schema from ${validationModbus}`);
      schema = await response.json();
      validate = ajv.compile(schema);
      valid = validate(tdCopy);
      if (!valid) {
        setIsValid(false);
        setErrorMessage(
          `Validation failed for ${validationModbus}: ${
            validate.errors ? ajv.errorsText(validate.errors) : ""
          }`
        );
        return;
      }

      setIsValid(true);
      setErrorMessage("");
    } catch (err) {
      setIsValid(false);
      setErrorMessage(
        "Could not validate: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleTmCatalogEndpointChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setTmCatalogEndpoint(value);
    if (
      !value.startsWith("https") &&
      !value.startsWith("http:") &&
      value.length > 0
    ) {
      setTmCatalogEndpointError("The endpoint must start with http or https.");
    } else {
      setTmCatalogEndpointError("");
    }
    setSubmitted(false);
    setSubmittedError("");
  };

  const handleRepositoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRepository(value);

    if (value.length === 0) {
      setRepositoryError("The repository name is mandatory");
    } else {
      setRepositoryError("");
    }
    setSubmitted(false);
    setSubmittedError("");
  };

  const handleCopyIdClick = async () => {
    await navigator.clipboard.writeText(id);
  };

  const handleOpenLinkClick = async () => {
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleCopyThingModelClick = async () => {
    const tdCopy = structuredClone(td);

    tdCopy["schema:mpn"] = model;
    tdCopy["schema:author"] = { "schema:name": author };
    tdCopy["schema:manufacturer"] = {
      "@type": "Organization",
      "schema:name": manufacturer,
    };
    tdCopy["schema:license"] = license;
    tdCopy["schema:copyrightYear"] = copyrightYear;
    tdCopy["schema:copyrightHolder"] = {
      "@type": "Organization",
      "schema:name": holder,
    };
    await navigator.clipboard.writeText(JSON.stringify(tdCopy, null, 2));
    setCopied(true);
  };

  const content = (
    <>
      <div className="rounded-md bg-black bg-opacity-80 p-2">
        <h1 className="font-bold">
          Add fields for Cataloging to ensure quality and discoverability of
          Thing Models
        </h1>
        <div className="px-4">
          <DialogTextField
            label="Model*"
            placeholder="The Manufacturer Part Number (MPN) of the product, or the product to which the offer refers."
            id="model"
            type="text"
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
              setIsValid(false);
              setSubmitted(false);
            }}
            autoFocus={true}
          />
          <DialogTextField
            label="Author*"
            placeholder="The organization writing the TM"
            id="author"
            type="text"
            value={author}
            onChange={(e) => {
              setAuthor(e.target.value);
              setIsValid(false);
              setSubmitted(false);
            }}
            autoFocus={false}
          />
          <DialogTextField
            label="Manufacturer*"
            placeholder="Manufacturer of the device"
            id="manufacturer"
            type="text"
            value={manufacturer}
            onChange={(e) => {
              setManufacturer(e.target.value);
              setIsValid(false);
              setSubmitted(false);
            }}
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
          <div className="flex flex-col">
            <BaseButton
              id="catalogValidation"
              onClick={handleCatalogValidation}
              variant="primary"
              type="button"
              className="my-2 w-1/4"
            >
              <div className="flex w-full items-center justify-between">
                {isValidating ? (
                  <>
                    <span className="pl-6">Validating</span>
                    <RefreshCw className="animate-spin" size={20} />
                  </>
                ) : (
                  <>
                    <span className="pl-6">Validate</span>
                    <InfoIconWrapper
                      tooltip={getValidateTMContent()}
                      id="validateTMContent"
                    />
                  </>
                )}
              </div>
            </BaseButton>
            {errorMessage && (
              <div className="mb-2 mt-2 inline h-full w-full rounded bg-red-500 p-2 text-white">
                <AlertTriangle size={16} className="mr-1 inline" />
                {errorMessage}
              </div>
            )}
            {isValid && (
              <>
                <div className="mb-2 mt-2 inline h-10 rounded bg-green-500 p-2 text-white">
                  <Check size={16} className="mr-1 inline" />
                  {"TM is valid"}
                </div>
                <BaseButton
                  id="copyThingModel"
                  onClick={handleCopyThingModelClick}
                  variant="primary"
                  type="button"
                  className="my-2"
                >
                  {copied
                    ? "Copied Thing Model"
                    : "Click to Copy the full Thing Model"}
                </BaseButton>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="my-4 rounded-md bg-black bg-opacity-80 p-2">
        <h1 className="font-bold">
          Add the TM Catalog Endpoint and Repository URL
        </h1>
        <div className="px-4">
          <DialogTextField
            label="TM Catalog Endpoint"
            placeholder="TM Catalog Endpoint:..."
            id="catalogEndpoint"
            type="text"
            value={tmCatalogEndpoint}
            autoFocus={false}
            onChange={handleTmCatalogEndpointChange}
            className={`${
              tmCatalogEndpointError ? "border-red-500" : "border-gray-300"
            } w-full rounded-md border p-2 text-sm`}
          />
          {tmCatalogEndpointError && (
            <div className="mt-1 text-sm text-red-500">
              {tmCatalogEndpointError}
            </div>
          )}
          <DialogTextField
            label="Name of the Repository"
            placeholder="In case there are multiple repositories hosted, specify which one with a string. Example: my-catalog"
            id="urlRepository"
            type="text"
            value={repository}
            autoFocus={false}
            onChange={handleRepositoryChange}
            className={`${
              repositoryError ? "border-red-500" : "border-gray-300"
            } w-full rounded-md border p-2 text-sm`}
          />
          {repositoryError && (
            <div className="mt-1 text-sm text-red-500">{repositoryError}</div>
          )}
          <div className="flex flex-col">
            <BaseButton
              id="submit"
              onClick={handleSubmit}
              variant="primary"
              type="button"
              className="mb-2 mt-2 w-1/4"
            >
              Submit
            </BaseButton>
            {submittedError && (
              <div className="mb-2 mt-2 inline h-full w-full rounded bg-red-500 p-2 text-white">
                <AlertTriangle size={16} className="mr-1 inline" />
                {submittedError}
              </div>
            )}
            {submitted && (
              <>
                <div className="mb-2 mt-2 inline h-10 rounded bg-green-500 p-2 text-white">
                  <Check size={16} className="mr-1 inline" />
                  {"TM submitted successfully!"}
                </div>
                <div className="mb-2 mt-2 grid grid-cols-3 items-center">
                  <div className="col-span-1 w-full">
                    <BaseButton
                      id={id}
                      onClick={handleCopyIdClick}
                      variant="primary"
                      type="button"
                      className="w-3/4"
                    >
                      <div className="flex w-full items-center justify-between">
                        <span>Copy TM id</span>
                        <Copy size={20} className="ml-2 cursor-pointer" />
                      </div>
                    </BaseButton>
                  </div>
                  <h1 className="col-span-2 pl-4 text-center">{id}</h1>
                </div>
                <div className="mb-2 mt-2 grid grid-cols-3 items-center">
                  <div className="col-span-1">
                    <BaseButton
                      id={link}
                      onClick={handleOpenLinkClick}
                      variant="primary"
                      type="button"
                      className="w-3/4"
                    >
                      <div className="flex w-full items-center justify-between">
                        <span>Open in new tab</span>
                        <ExternalLink
                          size={20}
                          className="ml-2 inline cursor-pointer"
                        />
                      </div>
                    </BaseButton>
                  </div>
                  <h1 className="col-span-2 pl-4 text-center">{link}</h1>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );

  if (display) {
    return ReactDOM.createPortal(
      <DialogTemplate
        onCancel={close}
        onSubmit={handleSubmit}
        children={content}
        hasSubmit={false}
        cancelText="Close"
        title={"Contribute your TM to a TM Catalog"}
        description={
          "Fullfil the form below to contribute your TM to the Catalog specified in the endpoint at the end."
        }
      />,
      document.getElementById("modal-root") as HTMLElement
    );
  }

  return null;
});

function normalizeContext(context: any): any {
  const TD_CONTEXTS = [
    "https://www.w3.org/2022/wot/td/v1.1",
    "https://www.w3.org/2019/wot/td/v1",
  ];
  const SCHEMA_URL = "https://schema.org/";

  if (typeof context === "string") {
    if (TD_CONTEXTS.includes(context)) {
      return [context, { schema: SCHEMA_URL }];
    }
    throw new Error("validation schema is wrong");
  }
  if (Array.isArray(context)) {
    const tdContexts = context.filter(
      (item) => typeof item === "string" && TD_CONTEXTS.includes(item)
    );
    const objContexts = context.filter(
      (item) => typeof item === "object" && item !== null
    );
    if (tdContexts.length > 0) {
      if (objContexts.length > 0) {
        const newObjContexts = objContexts.map((obj) =>
          "schema" in obj ? obj : { schema: SCHEMA_URL, ...obj }
        );
        return [...tdContexts, ...newObjContexts];
      } else {
        return [...tdContexts, { schema: SCHEMA_URL }];
      }
    }
    return context;
  }
  return context;
}

ContributeToCatalog.displayName = "ContributeToCatalog";
export default ContributeToCatalog;
