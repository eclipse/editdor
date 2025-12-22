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
import React, { useRef, useContext, useEffect, useMemo } from "react";
import type { ThingDescription } from "wot-thing-description-types";
import { isEqual } from "lodash";

import ediTDorContext from "../../context/ediTDorContext";
import BaseTable from "../TDViewer/base/BaseTable";
import BaseButton from "../TDViewer/base/BaseButton";
import { readPropertyWithServient } from "../../services/form";
import { extractIndexFromId } from "../../utils/strings";
import { getErrorSummary } from "../../utils/arrays";
import Settings, { SettingsData } from "./Settings";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RefreshCw,
} from "react-feather";
import TmInputForm from "../base/TmInputForm";
import { prepareTdForSubmission } from "../../services/operations";
import { readAllReadablePropertyForms } from "../../services/thingsApiService";
import {
  handleHttpRequest,
  fetchNorthboundTD,
} from "../../services/thingsApiService";
import { ContributionToCatalogAction } from "../../context/ContributeToCatalogState";

interface IFormInteractionProps {
  filteredHeaders: { key: string; text: string }[];
  filteredRows: any[];
  backgroundTdToSend: ThingDescription;
  interaction: ContributionToCatalogState["interaction"];
  dispatch: React.Dispatch<ContributionToCatalogAction>;
  handleFieldChange: (placeholder: string, value: string) => void;
}

const FormInteraction: React.FC<IFormInteractionProps> = ({
  filteredHeaders,
  filteredRows,
  interaction,
  backgroundTdToSend,
  dispatch,
  handleFieldChange,
}) => {
  const context = useContext(ediTDorContext);
  const td: ThingDescription = context.parsedTD;

  const {
    activeSection,
    sectionErrors,
    isTestingAll,
    settingsData,
    placeholderValues,
    propertyResponseMap,
  } = interaction;

  const requestNorthboundTdVersion = async (
    id: string,
    td: ThingDescription
  ) => {
    try {
      const url = settingsData.southboundUrl;
      const response = await handleHttpRequest(
        `${url}`,
        "POST",
        JSON.stringify(td)
      );
      if (
        response.status === 200 ||
        response.status === 201 ||
        response.status === 409
      ) {
        const responseNorthbound = await fetchNorthboundTD(id);
        context.updateNorthboundConnection({
          message: responseNorthbound.message,
          northboundTd: responseNorthbound.data ?? {},
        });
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (e) {
      console.error("Error request Northbound Td Version :", e);
    }
  };

  const summary = useMemo(
    () => getErrorSummary(propertyResponseMap),
    [propertyResponseMap]
  );

  const validateCurrentSection = (): boolean => {
    switch (activeSection) {
      case "INSTANCE":
        let instanceIsValid = Object.values(placeholderValues).every(
          (val) => val !== undefined && val !== null && val.trim() !== ""
        );
        if (!instanceIsValid) {
          dispatch({
            type: "SET_INTERACTION_SECTION_ERROR",
            section: "instance",
            error: true,
            message: "All fields in section Instance must have values",
          });
          return false;
        }
        dispatch({
          type: "SET_INTERACTION_SECTION_ERROR",
          section: "instance",
          error: false,
          message: "",
        });
        return true;
      case "GATEWAY":
        dispatch({
          type: "SET_INTERACTION_SECTION_ERROR",
          section: "gateway",
          error: false,
          message: "",
        });

        return true;
      case "TABLE":
        return true;

      case "SAVING_RESULTS":
        return true;
      default:
        return true;
    }
  };

  const toggleSection = (sectionName: ActiveSection) => {
    const currentSectionValid = validateCurrentSection();

    if (sectionName === "TABLE") {
      let preparedTd = {} as ThingDescription;

      try {
        preparedTd = prepareTdForSubmission(
          backgroundTdToSend,
          placeholderValues
        );
        dispatch({
          type: "SET_BACKGROUND_TD_TO_SEND",
          payload: preparedTd,
        });
      } catch (error) {
        dispatch({
          type: "SET_INTERACTION_SECTION_ERROR",
          section: "table",
          error: true,
          message: `Failed to prepare TD: ${error instanceof Error ? error.message : String(error)}`,
        });
        return;
      }
      if (
        settingsData.northboundUrl.trim() !== "" &&
        settingsData.southboundUrl.trim() !== ""
      ) {
        if (preparedTd.id) {
          requestNorthboundTdVersion(preparedTd.id, preparedTd);
        } else {
          dispatch({
            type: "SET_INTERACTION_SECTION_ERROR",
            section: "table",
            error: true,
            message: "Cannot interact with the TD: missing ID",
          });
        }
      }
    }

    if (activeSection === sectionName) {
      dispatch({
        type: "SET_INTERACTION_ACTIVE_SECTION",
        payload: "INSTANCE",
      });
    } else {
      dispatch({
        type: "SET_INTERACTION_ACTIVE_SECTION",
        payload: sectionName,
      });
    }
  };

  const handleTestAllProperties = async () => {
    dispatch({ type: "SET_INTERACTION_TESTING_ALL", payload: true });
    try {
      const tdSource =
        Object.keys(context.northboundConnection.northboundTd).length > 0
          ? (context.northboundConnection.northboundTd as ThingDescription)
          : backgroundTdToSend;
      const results = await readAllReadablePropertyForms(
        tdSource,
        filteredRows.map((r) => ({ id: r.id, propName: r.propName })),
        settingsData.pathToValue
      );
      dispatch({
        type: "SET_INTERACTION_PROPERTY_RESPONSE_MAP",
        payload: { ...propertyResponseMap, ...results },
      });
    } finally {
      dispatch({ type: "SET_INTERACTION_TESTING_ALL", payload: false });
    }
  };

  const handleOnClickSendRequest = async (item: {
    [key: string]: any;
  }): Promise<{ value: string; error: string }> => {
    const index = extractIndexFromId(item.id);

    let result = { value: "", error: "" };

    try {
      const res = await readPropertyWithServient(
        Object.keys(context.northboundConnection.northboundTd).length > 0
          ? (context.northboundConnection.northboundTd as ThingDescription)
          : backgroundTdToSend,
        item.propName,
        { formIndex: index },
        settingsData.pathToValue || ""
      );

      if (res.err) {
        result = { value: "", error: res.err.message };
      } else {
        result = { value: res.result, error: "" };
      }
    } catch (err: any) {
      result = { value: "", error: err.message || "Unknown error" };
    }
    const newResponseMap = { ...propertyResponseMap, [item.id]: result };
    dispatch({
      type: "SET_INTERACTION_PROPERTY_RESPONSE_MAP",
      payload: newResponseMap,
    });

    return result;
  };

  function usePrevious(value: any) {
    const ref = useRef();

    useEffect(() => {
      ref.current = value;
    }, [value]);

    return ref.current;
  }

  const prevSettings = usePrevious(settingsData);
  const handleSettingsChange = (data: SettingsData, valid: boolean) => {
    if (valid && !isEqual(data, prevSettings)) {
      dispatch({
        type: "SET_INTERACTION_SETTINGS_DATA",
        payload: data,
      });
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="mb-2 w-full rounded-md bg-opacity-80 p-3 text-white">
          <p className="text-lg">
            If you want to verify the correctness of your Thing Model, you can
            interact with a device instance here. To do so, please configure the
            proxy (northbound, southound, valuepath) and provide
            instance-specific information such as IP address.
          </p>
        </div>
        <div
          id="instanceSection"
          className="overflow-hidden rounded-md bg-black bg-opacity-80"
        >
          <div
            className="flex cursor-pointer items-center p-2 font-bold"
            onClick={() => toggleSection("INSTANCE")}
          >
            <ChevronDown
              size={16}
              className={`mr-2 transition-transform duration-200 ${activeSection === "INSTANCE" ? "rotate-0" : "-rotate-90"}`}
            />
            <span className="flex-grow"> 2.1 Instance</span>
            {activeSection === "INSTANCE" ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronUp size={16} />
            )}
          </div>

          {activeSection === "INSTANCE" &&
            Object.keys(placeholderValues).length > 0 && (
              <div className="w-full p-2">
                <div className="mx-auto mb-2 w-[70%]">
                  <TmInputForm
                    inputValues={placeholderValues}
                    onValueChange={handleFieldChange}
                  />
                </div>
              </div>
            )}
          {activeSection === "INSTANCE" &&
            Object.keys(placeholderValues).length === 0 && (
              <div className="w-full p-2">
                <div className="mx-auto mb-2 w-[70%]">
                  <h1>
                    There are no placeholders in the following Things Model.
                  </h1>
                </div>
              </div>
            )}
          {sectionErrors.instance.error && (
            <div className="my-2 h-full w-full rounded bg-red-500 p-1 text-white">
              <AlertTriangle
                size={18}
                className="mx-2 inline-flex text-black"
              />
              {sectionErrors.instance.message}
            </div>
          )}
        </div>

        <div
          id="gatewaySection"
          className="overflow-hidden rounded-md bg-black bg-opacity-80"
        >
          <div
            className="flex cursor-pointer items-center p-2 font-bold"
            onClick={() => toggleSection("GATEWAY")}
          >
            <ChevronDown
              size={16}
              className={`mr-2 transition-transform duration-200 ${activeSection === "GATEWAY" ? "rotate-0" : "-rotate-90"}`}
            />
            <span className="flex-grow"> 2.2 Gateway</span>
            {activeSection === "GATEWAY" ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronUp size={16} />
            )}
          </div>

          {activeSection === "GATEWAY" && (
            <div className="w-full p-2">
              <div className="mx-auto mt-4 w-[70%]">
                <Settings
                  initialData={settingsData}
                  onChange={handleSettingsChange}
                />
              </div>
            </div>
          )}
          {sectionErrors.gateway.error && (
            <div className="mb-2 mt-2 h-full w-full rounded bg-red-500 p-1 text-white">
              <AlertTriangle
                size={18}
                className="mx-2 inline-flex text-black"
              />
              {sectionErrors.gateway.message}
            </div>
          )}
        </div>

        <div
          id="tableSection"
          className="overflow-hidden rounded-md bg-black bg-opacity-80"
        >
          <div
            className="flex cursor-pointer items-center p-2 font-bold"
            onClick={() => toggleSection("TABLE")}
          >
            <ChevronDown
              size={16}
              className={`mr-2 transition-transform duration-200 ${activeSection === "TABLE" ? "rotate-0" : "-rotate-90"}`}
            />
            <span className="flex-grow"> 2.3 Value Verification</span>
            {activeSection === "TABLE" ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronUp size={16} />
            )}
          </div>

          {activeSection === "TABLE" && (
            <div className="mt-4 w-full p-2">
              <h1 className="font-bold">
                Read property values from device instance
              </h1>
              <div className="p-2">
                <BaseTable
                  headers={filteredHeaders}
                  items={filteredRows}
                  itemsPerPage={10}
                  orderBy=""
                  order="asc"
                  baseUrl={td.base ?? ""}
                  expandTable={true}
                  onSendRequestClick={handleOnClickSendRequest}
                  requestResults={propertyResponseMap}
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
              {summary.errorCount > 0 && (
                <div className="mt-4 rounded-md bg-red-100 p-3 text-red-700">
                  <p className="font-bold">
                    Found {summary.errorCount} error
                    {summary.errorCount > 1 ? "s" : ""}
                  </p>
                  <p className="mt-1">
                    First error in property name{" "}
                    <span className="font-semibold">
                      {summary.firstError.id}
                    </span>
                    : {summary.firstError.message}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div
          id="savingResultsSection"
          className="overflow-hidden rounded-md bg-black bg-opacity-80"
        >
          <div
            className="flex cursor-pointer items-center p-2 font-bold"
            onClick={() => toggleSection("SAVING_RESULTS")}
          >
            <ChevronDown
              size={16}
              className={`mr-2 transition-transform duration-200 ${activeSection === "SAVING_RESULTS" ? "rotate-0" : "-rotate-90"}`}
            />
            <span className="flex-grow"> 2.4 Saving results</span>
            {activeSection === "SAVING_RESULTS" ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronUp size={16} />
            )}
          </div>

          {activeSection === "SAVING_RESULTS" && (
            <div className="p-2 pt-0">
              <div className="mx-auto w-[70%]">
                A feature for saving the property values will be added later on.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FormInteraction;
