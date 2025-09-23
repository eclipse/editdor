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
import React, { useState, useContext, useEffect, useMemo } from "react";
import type { ThingDescription } from "wot-thing-description-types";
import type { ActiveSection } from "../../../types/global";

import ediTDorContext from "../../../context/ediTDorContext";
import BaseTable from "../../TDViewer/base/BaseTable";
import BaseButton from "../../TDViewer/base/BaseButton";
import { readPropertyWithServient } from "../../../services/form";
import { extractIndexFromId } from "../../../utils/strings";
import {
  getLocalStorage,
  setLocalStorage,
} from "../../../services/localStorage";
import { getErrorSummary } from "../../../utils/arrays";
import Settings, { SettingsData } from "../../App/Settings";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RefreshCw,
} from "react-feather";
import TmInputForm from "../../App/TmInputForm";
import {
  replacePlaceholders,
  replaceStringOnTopLevelKey,
} from "../../../services/operations";
import {
  handleHttpRequest,
  fetchNorthboundTD,
  isSuccessResponse,
} from "../../../services/thingsApiService";

interface FormInteractionProps {
  filteredHeaders: { key: string; text: string }[];
  filteredRows: any[];
  propertyResponseMap: { [id: string]: { value: string; error: string } };
  setPropertyResponseMap: React.Dispatch<
    React.SetStateAction<{ [id: string]: { value: string; error: string } }>
  >;
  placeholderValues?: Record<string, string>;
  handleFieldChange: (placeholder: string, value: string) => void;
}

const FormInteraction: React.FC<FormInteractionProps> = ({
  filteredHeaders,
  filteredRows,
  propertyResponseMap,
  setPropertyResponseMap,
  placeholderValues = {},
  handleFieldChange,
}) => {
  const context = useContext(ediTDorContext);
  const td: ThingDescription = context.parsedTD;

  const [activeSection, setActiveSection] = useState<ActiveSection>("instance");
  const [errorInteraction, setErrorInteraction] = useState<{
    instance: {
      error: boolean;
      message: string;
    };
    gateway: {
      error: boolean;
      message: string;
    };
    table: {
      error: boolean;
      message: string;
    };
    results: {
      error: boolean;
      message: string;
    };
  }>({
    instance: {
      error: false,
      message: "",
    },
    gateway: {
      error: false,
      message: "",
    },
    table: {
      error: false,
      message: "",
    },
    results: {
      error: false,
      message: "",
    },
  });
  const [backgroundTdToSend, setBackgroundTdToSend] =
    useState<ThingDescription>(td);

  const [isTestingAll, setIsTestingAll] = useState<boolean>(false);
  const [settingsData, setSettingsData] = useState<SettingsData>({
    northboundUrl: getLocalStorage("northbound") || "",
    southboundUrl: getLocalStorage("southbound") || "",
    pathToValue: getLocalStorage("valuePath") || "/",
  });

  useEffect(() => {
    setLocalStorage(settingsData.northboundUrl, "northbound");
    setLocalStorage(settingsData.southboundUrl, "southbound");
    setLocalStorage(settingsData.pathToValue, "valuePath");
  }, [settingsData]);

  useEffect(() => {
    const updateBackgroundTd = async () => {
      if (activeSection === "table") {
        let backgroundTdToSendStringify = JSON.stringify(context.parsedTD);
        let newGeneratedTm = backgroundTdToSendStringify;
        if (placeholderValues && Object.keys(placeholderValues).length > 0) {
          newGeneratedTm = replacePlaceholders(
            backgroundTdToSendStringify,
            placeholderValues
          );
        }
        // Gives an error when id have "/"
        // Check the parsing errors on placeholders when they have "{{}}" and only {{}}

        try {
          const {
            "@type": typeValue,
            "tm:required": tmRequired,
            ...cleanedTm
          } = JSON.parse(newGeneratedTm);
          const { modifiedStructure, summary } = replaceStringOnTopLevelKey(
            cleanedTm,
            "base",
            "modbus",
            "http"
          );
          setBackgroundTdToSend(modifiedStructure);
        } catch (e) {
          console.error("Error parsing JSON after replacement:", e);
        }

        try {
          const url = getLocalStorage("southbound");
          if (!url) throw new Error("Southbound Url must be defined");
          // Sanitation of URL
          const endpoint = `${url}`;

          const response = await handleHttpRequest(
            `${endpoint}`,
            "POST",
            JSON.stringify(backgroundTdToSend)
          );

          const currentTdId = backgroundTdToSend.id;
          if (!currentTdId) {
            throw new Error("TD must have an id");
          }
          if (isSuccessResponse(response)) {
            if (response.status === 201 || response.status === 200) {
              const responseNorthbound = await fetchNorthboundTD(currentTdId);
              context.updateNorthboundConnection({
                message: responseNorthbound.message,
                northboundTd: responseNorthbound.data ?? {},
              });
            } else {
              console.error(response.data);
              throw new Error(
                `Success Response but Status is : ${response.status}`
              );
            }
          } else {
            //if status 409 means it already exists, so I need to fetch the northbound TD again
            if (response.reason.includes("already exists")) {
              const responseNorthbound = await fetchNorthboundTD(currentTdId);
              context.updateNorthboundConnection({
                message: responseNorthbound.message,
                northboundTd: responseNorthbound.data ?? {},
              });
            } else {
              console.error(response);
              throw new Error(`Failed to send TD. Status: ${response}`);
            }
          }
        } catch (error) {
          console.error("Error on generating TD:", error);
        }
      }
    };
    updateBackgroundTd();
  }, [activeSection, placeholderValues]);

  const summary = useMemo(
    () => getErrorSummary(propertyResponseMap),
    [propertyResponseMap]
  );

  const validateCurrentSection = (): boolean => {
    switch (activeSection) {
      case "instance":
        let instanceIsValid = Object.values(placeholderValues).every(
          (val) => val !== undefined && val !== null && val.trim() !== ""
        );
        if (!instanceIsValid) {
          setErrorInteraction({
            ...errorInteraction,
            instance: {
              error: true,
              message: "All fields in section Instance must have values",
            },
          });
          return false;
        }
        setErrorInteraction({
          ...errorInteraction,
          instance: {
            error: false,
            message: "",
          },
        });
        return true;
      case "gateway":
        let gatewayIsValid =
          settingsData.northboundUrl.trim() !== "" &&
          settingsData.southboundUrl.trim() !== "" &&
          settingsData.pathToValue.trim() !== "";
        if (!gatewayIsValid) {
          setErrorInteraction({
            ...errorInteraction,
            gateway: {
              error: true,
              message: "All fields in section Gateway must have values",
            },
          });
          return false;
        }
        setErrorInteraction({
          ...errorInteraction,
          gateway: {
            error: false,
            message: "",
          },
        });
        return true;
      case "table":
        // if (errorInteraction.instance.error || errorInteraction.gateway.error) {
        // setErrorInteraction({
        // ...errorInteraction,
        // table: {
        // error: true,
        // message:
        // "Please fix errors in previous sections before proceeding",
        // },
        // });
        // return false;
        // }
        // setErrorInteraction({
        // ...errorInteraction,
        // table: {
        // error: false,
        // message: "",
        // },
        // });

        return true;

      case "savingResults":
        return true;
      default:
        return true;
    }
  };

  const toggleSection = (sectionName: ActiveSection) => {
    const currentSectionValid = validateCurrentSection();
    if (activeSection === sectionName) {
      setActiveSection("instance");
    } else {
      setActiveSection(sectionName);
    }
  };

  const handleTestAllProperties = async () => {
    setIsTestingAll(true);
    const results = { ...propertyResponseMap };

    for (const item of filteredRows) {
      try {
        const res = await readPropertyWithServient(
          context.northboundConnection.northboundTd as ThingDescription,
          item.propName,
          {
            formIndex: extractIndexFromId(item.id as string),
          },
          settingsData.pathToValue
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

    setPropertyResponseMap(results);
    setIsTestingAll(false);
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
          : td,
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
    setPropertyResponseMap((prev) => ({
      ...prev,
      [item.id]: result,
    }));

    return result;
  };

  const handleSettingsChange = (data: SettingsData, valid: boolean) => {
    if (valid) {
      setSettingsData(data);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="mb-2 w-full rounded-md bg-opacity-80 p-3 text-white">
          <p className="text-lg">
            If you want to verify the correctness of your model, you can
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
            onClick={() => toggleSection("instance")}
          >
            <ChevronDown
              size={16}
              className={`mr-2 transition-transform duration-200 ${activeSection === "instance" ? "rotate-0" : "-rotate-90"}`}
            />
            <span className="flex-grow"> 2.1 Instance</span>
            {activeSection === "instance" ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronUp size={16} />
            )}
          </div>

          {activeSection === "instance" &&
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
          {activeSection === "instance" &&
            Object.keys(placeholderValues).length === 0 && (
              <div className="w-full p-2">
                <div className="mx-auto mb-2 w-[70%]">
                  <h1>
                    There are no placeholders in the following Things Model.
                  </h1>
                </div>
              </div>
            )}
          {errorInteraction.instance.error && (
            <div className="my-2 h-full w-full rounded bg-red-500 p-1 text-white">
              <AlertTriangle
                size={18}
                className="mx-2 inline-flex text-black"
              />
              {errorInteraction.instance.message}
            </div>
          )}
        </div>

        <div
          id="gatewaySection"
          className="overflow-hidden rounded-md bg-black bg-opacity-80"
        >
          <div
            className="flex cursor-pointer items-center p-2 font-bold"
            onClick={() => toggleSection("gateway")}
          >
            <ChevronDown
              size={16}
              className={`mr-2 transition-transform duration-200 ${activeSection === "gateway" ? "rotate-0" : "-rotate-90"}`}
            />
            <span className="flex-grow"> 2.2 Gateway</span>
            {activeSection === "gateway" ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronUp size={16} />
            )}
          </div>

          {activeSection === "gateway" && (
            <div className="w-full p-2">
              <div className="mx-auto mt-4 w-[70%]">
                <Settings
                  initialData={settingsData}
                  onChange={handleSettingsChange}
                />
              </div>
            </div>
          )}
          {errorInteraction.gateway.error && (
            <div className="mb-2 mt-2 h-full w-full rounded bg-red-500 p-1 text-white">
              <AlertTriangle
                size={18}
                className="mx-2 inline-flex text-black"
              />
              {errorInteraction.gateway.message}
            </div>
          )}
        </div>

        <div
          id="tableSection"
          className="overflow-hidden rounded-md bg-black bg-opacity-80"
        >
          <div
            className="flex cursor-pointer items-center p-2 font-bold"
            onClick={() => toggleSection("table")}
          >
            <ChevronDown
              size={16}
              className={`mr-2 transition-transform duration-200 ${activeSection === "table" ? "rotate-0" : "-rotate-90"}`}
            />
            <span className="flex-grow"> 2.3 Table</span>
            {activeSection === "table" ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronUp size={16} />
            )}
          </div>

          {activeSection === "table" && (
            <div className="mt-4 w-full p-2">
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
            onClick={() => toggleSection("savingResults")}
          >
            <ChevronDown
              size={16}
              className={`mr-2 transition-transform duration-200 ${activeSection === "savingResults" ? "rotate-0" : "-rotate-90"}`}
            />
            <span className="flex-grow"> 2.4 Saving results</span>
            {activeSection === "savingResults" ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronUp size={16} />
            )}
          </div>

          {activeSection === "savingResults" && (
            <div className="p-2 pt-0">
              <div className="mx-auto w-[70%]">Saving Results ...</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FormInteraction;
