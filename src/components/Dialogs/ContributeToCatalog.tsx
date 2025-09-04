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
import React, {
  forwardRef,
  useContext,
  useImperativeHandle,
  useState,
  useMemo,
} from "react";
import ReactDOM from "react-dom";
import { RefreshCw } from "react-feather";
import draft7MetaSchema from "ajv/dist/refs/json-schema-draft-07.json";
import type {
  FormElementBase,
  ThingDescription,
} from "wot-thing-description-types";
import "react-step-progress-bar/styles.css";
import Ajv2019 from "ajv/dist/2019";
import addFormats from "ajv-formats";
import { ProgressBar, Step } from "react-step-progress-bar";

import ediTDorContext from "../../context/ediTDorContext";
import DialogTemplate from "./DialogTemplate";
import BaseButton from "../TDViewer/base/BaseButton";
import FormCatalogFields from "./base/FormCatalogFields";
import FormCatalogTmEndpoints from "./base/FormCatalogTmEndpoints";
import { isValidUrl, formatText } from "../../utils/strings";
import { requestWeb } from "../../services/thingsApiService";
import BaseTable from "../TDViewer/base/BaseTable";
import { readPropertyWithServient } from "../../services/form";
import { extractIndexFromId } from "../../utils/strings";
import { normalizeContext } from "../../services/operations";

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
  const context = useContext(ediTDorContext);
  const td: ThingDescription = context.parsedTD;

  const [display, setDisplay] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const [model, setModel] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [manufacturer, setManufacturer] = useState<string>("");
  const [license, setLicense] = useState<string>("");
  const [copyrightYear, setCopyrightYear] = useState<string>("");
  const [holder, setHolder] = useState<string>("");

  const [tmCatalogEndpoint, setTmCatalogEndpoint] = useState<string>("");
  const [repository, setRepository] = useState<string>("");

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [tmCatalogEndpointError, setTmCatalogEndpointError] =
    useState<string>("");

  const [repositoryError, setRepositoryError] = useState<string>("");

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [link, setLink] = useState<string>("");
  const [id, setId] = useState<string>("");

  const [submittedError, setSubmittedError] = useState<string>("");
  const [tmCopy, setTMCopy] = useState<ThingDescription | null>(null);
  const [workflowState, setWorkflowState] = useState<number>(1);
  const [allRequestResults, setAllRequestResults] = useState<{
    [id: string]: { value: string; error: string };
  }>({});
  const [isTestingAll, setIsTestingAll] = useState(false);

  useImperativeHandle(ref, () => {
    return {
      openModal: () => open(),
      close: () => close(),
    };
  });

  const propertiesTd = useMemo(() => {
    return td["properties"] || {};
  }, [td]);

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
    setWorkflowState(1);
    setAllRequestResults({});
    setIsTestingAll(false);
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

  const handleOnChangeModel = (e) => {
    setModel(e.target.value);
    setIsValid(false);
    setSubmitted(false);
  };

  const handleOnChangeAuthor = (e) => {
    setAuthor(e.target.value);
    setIsValid(false);
    setSubmitted(false);
  };

  const handleOnChangeManufacturer = (e) => {
    setManufacturer(e.target.value);
    setIsValid(false);
    setSubmitted(false);
  };

  const handleOnChangeLicense = (e) => {
    setLicense(e.target.value);
  };

  const handleOnChangeCopyrightYear = (e) => {
    setCopyrightYear(e.target.value);
  };

  const handleOnChangeHolder = (e) => {
    setHolder(e.target.value);
  };

  const progressPercent =
    workflowState === 1 ? 0 : workflowState === 2 ? 50 : 100;

  const tableHeaders: { key: string; text: string }[] = Object.keys(
    propertiesTd
  ).length
    ? [
        ...["propName"],
        ...[
          ...new Set(
            Object.keys(propertiesTd).flatMap((key) => {
              const forms = propertiesTd[key].forms || [];
              return forms.flatMap((form: FormElementBase) =>
                Object.keys(form)
              );
            })
          ),
        ],
        ...["previewValue"],
      ].map((key) => ({
        key,
        text: formatText(key),
      }))
    : [];

  const tabelRowsFormsOfProperties = Object.keys(propertiesTd).flatMap(
    (key) => {
      const forms = propertiesTd[key].forms || [];
      return forms.map((form: FormElementBase, index: number) => ({
        id: `${key} - ${index}`,
        description: propertiesTd[key].description ?? "",
        propName: key,
        ...form,
      }));
    }
  );

  let filteredRows = tabelRowsFormsOfProperties.filter(
    (form: FormElementBase) => {
      if (Array.isArray(form.op)) {
        return form.op.includes("readproperty");
      }
      return form.op === "readproperty";
    }
  );

  let filteredHeaders = tableHeaders.filter(
    (header) =>
      header.key === "previewValue" ||
      header.key === "propName" ||
      header.key === "href" ||
      header.key === "contentType"
  );

  const handleTestAllProperties = async () => {
    setIsTestingAll(true);
    const results = { ...allRequestResults };

    for (const item of filteredRows) {
      try {
        const res = await readPropertyWithServient(
          td,
          item.propName,
          {
            formIndex: extractIndexFromId(item.id as string),
          },
          ""
        );

        if (res.err) {
          results[item.id] = { value: "", error: res.err.message };
        } else {
          results[item.id] = { value: res.result, error: "" };
        }
      } catch (err: any) {
        results[item.id] = { value: "", error: err.message };
      }
    }

    setAllRequestResults(results);
    setIsTestingAll(false);
  };

  const content = (
    <>
      <div className="p-4">
        <div className="p-2">
          <ProgressBar
            percent={progressPercent}
            filledBackground="linear-gradient(to right, #A8B988, #B5D7BD)"
          >
            <Step transition="scale">
              {({ accomplished, index }) => (
                <div
                  className={`h-[30px] w-[30px] rounded-full ${accomplished ? "bg-[#B5D7BD]" : "bg-gray-300"} ${accomplished ? "text-white" : "text-gray-500"} flex items-center justify-center border-2 text-lg font-bold ${accomplished ? "border-[#f0bb31]" : "border-gray-300"} transition-colors duration-300`}
                >
                  {index + 1}
                </div>
              )}
            </Step>
            <Step transition="scale">
              {({ accomplished, index }) => (
                <div
                  className={`h-[30px] w-[30px] rounded-full ${
                    accomplished ? "bg-[#B5D7BD]" : "bg-gray-300"
                  } ${
                    accomplished ? "text-white" : "text-gray-500"
                  } flex items-center justify-center border-2 text-lg font-bold ${
                    accomplished ? "border-[#f0bb31]" : "border-gray-300"
                  } transition-colors duration-300`}
                >
                  {index + 1}
                </div>
              )}
            </Step>
            <Step transition="scale">
              {({ accomplished, index }) => (
                <div
                  className={`h-[30px] w-[30px] rounded-full ${
                    accomplished ? "bg-[#B5D7BD]" : "bg-gray-300"
                  } ${
                    accomplished ? "text-white" : "text-gray-500"
                  } flex items-center justify-center border-2 text-lg font-bold ${
                    accomplished ? "border-[#f0bb31]" : "border-gray-300"
                  } transition-colors duration-300`}
                >
                  {index + 1}
                </div>
              )}
            </Step>
          </ProgressBar>
        </div>

        <div className="my-4 flex space-x-2">
          {workflowState === 1 && (
            <>
              <FormCatalogFields
                model={model}
                onChangeModel={handleOnChangeModel}
                author={author}
                onChangeAuthor={handleOnChangeAuthor}
                manufacturer={manufacturer}
                onChangeManufacturer={handleOnChangeManufacturer}
                license={license}
                onChangeLicense={handleOnChangeLicense}
                copyrightYear={copyrightYear}
                onChangeCopyrightYear={handleOnChangeCopyrightYear}
                holder={holder}
                onChangeHolder={handleOnChangeHolder}
                onClickCatalogValidation={handleCatalogValidation}
                onClickCopyThingModel={handleCopyThingModelClick}
                isValidating={isValidating}
                isValid={isValid}
                errorMessage={errorMessage}
                copied={copied}
              />
            </>
          )}
          {workflowState === 2 && (
            <div className="w-full rounded-md bg-black bg-opacity-80 p-2">
              <h1 className="font-bold">Test endpoints on properties</h1>
              <div className="p-2">
                <BaseTable
                  headers={filteredHeaders}
                  items={filteredRows}
                  itemsPerPage={10}
                  orderBy=""
                  order="asc"
                  baseUrl={td.base ?? ""}
                  expandTable={true}
                  requestResults={allRequestResults}
                />
              </div>
              <div className="mb-4 mt-2 flex justify-end px-4">
                <BaseButton
                  onClick={handleTestAllProperties}
                  variant="primary"
                  type="button"
                  disabled={isTestingAll}
                  className="flex items-center"
                >
                  {isTestingAll ? (
                    <>
                      <RefreshCw className="mr-2 animate-spin" size={16} />
                      Testing...
                    </>
                  ) : (
                    "Test All Properties"
                  )}
                </BaseButton>
              </div>
            </div>
          )}
          {workflowState === 3 && (
            <>
              <FormCatalogTmEndpoints
                tmCatalogEndpoint={tmCatalogEndpoint}
                tmCatalogEndpointError={tmCatalogEndpointError}
                handleTmCatalogEndpointChange={handleTmCatalogEndpointChange}
                repository={repository}
                repositoryError={repositoryError}
                handleRepositoryChange={handleRepositoryChange}
                handleSubmit={handleSubmit}
                submittedError={submittedError}
                submitted={submitted}
                id={id}
                link={link}
              />
            </>
          )}
        </div>
      </div>
    </>
  );

  if (display) {
    return ReactDOM.createPortal(
      <DialogTemplate
        onHandleEventLeftButton={
          workflowState > 1 ? () => setWorkflowState(workflowState - 1) : close
        }
        onHandleEventRightButton={
          workflowState < 3 ? () => setWorkflowState(workflowState + 1) : close
        }
        children={content}
        hasSubmit={true}
        leftButton={workflowState > 1 ? "Previous" : "Close"}
        rightButton={workflowState < 3 ? "Next" : "Close"}
        title={"Contribute your TM to a TM Catalog"}
        description={
          "Fullfil the form below to contribute your TM to the Catalog specified in the endpoint at the end."
        }
        className="lg:w-[60%]"
      />,
      document.getElementById("modal-root") as HTMLElement
    );
  }

  return null;
});

ContributeToCatalog.displayName = "ContributeToCatalog";
export default ContributeToCatalog;
