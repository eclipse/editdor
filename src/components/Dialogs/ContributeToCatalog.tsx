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
import DialogButton from "./base/DialogButton";
import { Check, AlertTriangle, Copy, ExternalLink, Info } from "react-feather";
import { isValidUrl } from "../../utils/strings";
import Ajv from "ajv";
import { requestWeb } from "../../services/thingsApiService";
import Icon from "./../InfoIcon/Icon";

export interface IContributeToCatalogProps {
  openModal: () => void;
  close: () => void;
}

const ContributeToCatalog = forwardRef((props, ref) => {
  const validationTmUrl =
    "https://raw.githubusercontent.com/wot-oss/tmc/main/internal/commands/validate/tmc-mandatory.schema.json";

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

  const [tmCatalogEndpoint, setTmCatalogEndpoint] = React.useState<string>("");
  const [repository, setRepository] = React.useState<string>("");

  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [tmCatalogEndpointError, setTmCatalogEndpointError] =
    React.useState<string>("");

  const [repositoryError, setRepositoryError] = React.useState<string>("");

  const [submitted, setSubmitted] = React.useState<boolean>(false);
  const [link, setLink] = React.useState<string>("");
  const [id, setId] = React.useState<string>("");

  const [submittedError, setSubmittedError] = React.useState<string>("");

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

    if (!isValidUrl(decodedRepository) && decodedRepository !== "") {
      setRepositoryError(
        "Please enter a valid URL starting with http:// or https://"
      );
    }
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
    setIsValid(false);
    setDisplay(false);
  };

  const onSubmitClick = async () => {
    setSubmittedError("");
    setSubmitted(false);
    try {
      const response = await requestWeb(
        `${tmCatalogEndpoint}/thing-models`,
        "POST",
        JSON.stringify(td),
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
          setLink(`${tmCatalogEndpoint}/${tmID}`);
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

  const onCatalogValidationClick = async () => {
    setErrorMessage("");
    setIsValid(false);

    try {
      const response = await fetch(validationTmUrl);
      if (!response.ok) throw new Error("Failed to fetch online schema");
      const schema = await response.json();

      const ajv = new Ajv();
      const validate = ajv.compile(schema);

      const valid = validate(td);

      if (valid) {
        setIsValid(true);
        setErrorMessage("");
      } else {
        setIsValid(false);
        setErrorMessage(
          "Catalog validation failed: " +
            (validate.errors ? ajv.errorsText(validate.errors) : "")
        );
      }
    } catch (err) {
      setIsValid(false);
      setErrorMessage(
        "Could not validate: " +
          (err instanceof Error ? err.message : String(err))
      );
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
  };

  const handleRepositoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //
    const value = e.target.value;
    //
    setRepository(value);
    //
    if (
      !value.startsWith("https") &&
      !value.startsWith("http:") &&
      value.length > 0
    ) {
      setRepositoryError("The repository must start with http or https.");
    } else {
      setRepositoryError("");
    }

    if (!isValidUrl(value)) {
      setRepositoryError(
        "Please enter a valid URL starting with http:// or https://"
      );
    }
  };

  const handleCopyIdClick = async () => {
    await navigator.clipboard.writeText(id);
  };
  const handleOpenLinkClick = async () => {
    window.open(link, "_blank", "noopener,noreferrer");
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
          <div className="flex flex-col">
            <DialogButton
              id="catalogValidation"
              text={
                <div className="flex w-full items-center justify-between">
                  <span className="pl-6">Validate</span>
                  <Icon
                    html="Make sure that your TM is valid for cataloging purposes"
                    id="validateTooltip"
                    IconComponent={Info}
                    className="pr-6"
                  />
                </div>
              }
              className="my-2 w-1/4"
              onClick={onCatalogValidationClick}
            ></DialogButton>
            {errorMessage && (
              <div className="mb-2 mt-2 inline h-full w-full rounded bg-red-500 p-2 text-white">
                <AlertTriangle size={16} className="mr-1 inline" />
                {errorMessage}
              </div>
            )}
            {isValid && (
              <div className="mb-2 mt-2 inline h-10 rounded bg-green-500 p-2 text-white">
                <Check size={16} className="mr-1 inline" />
                {"TM is valid"}
              </div>
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
            label="Repository"
            placeholder="URL of the repository where the TM is stored"
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
            <DialogButton
              id="submit"
              text="Submit"
              className="mb-2 mt-2 w-1/4"
              onClick={onSubmitClick}
            ></DialogButton>
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
                    <DialogButton
                      id={id}
                      text={
                        <div className="flex w-full items-center justify-between">
                          <span>Copy TM id</span>
                          <Copy size={20} className="ml-2 cursor-pointer" />
                        </div>
                      }
                      onClick={handleCopyIdClick}
                      className="w-3/4"
                    ></DialogButton>
                  </div>
                  <h1 className="col-span-2 pl-4 text-center">{id}</h1>
                </div>
                <div className="mb-2 mt-2 grid grid-cols-3 items-center">
                  <div className="col-span-1">
                    <DialogButton
                      id={link}
                      text={
                        <div className="flex w-full items-center justify-between">
                          <span>Open in new tab</span>
                          <ExternalLink
                            size={20}
                            className="ml-2 inline cursor-pointer"
                          />
                        </div>
                      }
                      onClick={handleOpenLinkClick}
                      className="w-3/4"
                    ></DialogButton>
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
        onSubmit={onSubmitClick}
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

export default ContributeToCatalog;
