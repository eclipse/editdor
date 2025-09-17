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
import React, { useState, useContext, useEffect } from "react";
import { RefreshCw } from "react-feather";
import type { ThingDescription } from "wot-thing-description-types";

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
import { ChevronDown, ChevronUp } from "react-feather";
import TmInputForm from "../../App/TmInputForm";

interface ErrorAllRequests {
  firstError: {
    id: string;
    message: string;
  };
  errorCount: number;
}

type ActiveSection = "instance" | "gateway" | "table" | "savingResults";

interface FormInteractionProps {
  filteredHeaders: { key: string; text: string }[];
  filteredRows: any[];
  allRequestResults: { [id: string]: { value: string; error: string } };
  setAllRequestResults: React.Dispatch<
    React.SetStateAction<{ [id: string]: { value: string; error: string } }>
  >;
  errorAllRequests: ErrorAllRequests;
  setErrorAllRequests: React.Dispatch<React.SetStateAction<ErrorAllRequests>>;
  placeholderValues?: Record<string, string>;
  handleFieldChange: (placeholder: string, value: string) => void;
}

const FormInteraction: React.FC<FormInteractionProps> = ({
  filteredHeaders,
  filteredRows,
  allRequestResults,
  setAllRequestResults,
  errorAllRequests,
  setErrorAllRequests,
  placeholderValues = {},
  handleFieldChange,
}) => {
  const context = useContext(ediTDorContext);
  const td: ThingDescription = context.parsedTD;

  const [isTestingAll, setIsTestingAll] = useState<boolean>(false);
  const [settingsData, setSettingsData] = useState<SettingsData>({
    northboundUrl: getLocalStorage("northbound") || "",
    southboundUrl: getLocalStorage("southbound") || "",
    pathToValue: getLocalStorage("valuePath") || "/",
  });

  const [activeSection, setActiveSection] = useState<ActiveSection>("instance");

  useEffect(() => {
    setLocalStorage(settingsData.northboundUrl, "northbound");
    setLocalStorage(settingsData.southboundUrl, "southbound");
    setLocalStorage(settingsData.pathToValue, "valuePath");
  }, [settingsData]);

  const toggleSection = (sectionName: ActiveSection) => {
    if (activeSection === sectionName) {
      setActiveSection("instance");
    } else {
      setActiveSection(sectionName);
    }
    // if (activeSection === "instance") {
    //updateTD;
    //}
  };

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

    setAllRequestResults(results);
    const { firstError, errorCount } = getErrorSummary(results);
    if (errorCount > 0) {
      setErrorAllRequests({ firstError, errorCount });
    }
    setIsTestingAll(false);
  };

  const handleOnClickSendRequest = async (item: {
    [key: string]: any;
  }): Promise<{ value: string; error: string }> => {
    const index = extractIndexFromId(item.id);

    if (Object.keys(context.northboundConnection.northboundTd).length > 0) {
      try {
        const res = await readPropertyWithServient(
          context.northboundConnection.northboundTd as ThingDescription,
          item.propName,
          {
            formIndex: index,
          },
          settingsData.pathToValue
        );
        if (res.err) {
          return { value: "", error: res.err.message };
        }
        return { value: res.result, error: "" };
      } catch (err: any) {
        return { value: "", error: err.message };
      }
    } else {
      try {
        const res = await readPropertyWithServient(
          td,
          item.propName,
          {
            formIndex: index,
          },
          settingsData.pathToValue
        );
        if (res.err) {
          return { value: "", error: res.err.message };
        }
        return { value: res.result, error: "" };
      } catch (err: any) {
        return { value: "", error: err.message };
      }
    }
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
              {errorAllRequests?.errorCount > 0 && (
                <div className="mt-4 rounded-md bg-red-100 p-3 text-red-700">
                  <p className="font-bold">
                    Found {errorAllRequests.errorCount} error
                    {errorAllRequests.errorCount > 1 ? "s" : ""}
                  </p>
                  <p className="mt-1">
                    First error in property name{" "}
                    <span className="font-semibold">
                      {errorAllRequests.firstError.id}
                    </span>
                    :{errorAllRequests.firstError.message}
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
