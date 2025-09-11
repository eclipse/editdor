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
import React, { useState, useContext } from "react";
import { RefreshCw } from "react-feather";
import type { ThingDescription } from "wot-thing-description-types";

import ediTDorContext from "../../../context/ediTDorContext";
import BaseTable from "../../TDViewer/base/BaseTable";
import BaseButton from "../../TDViewer/base/BaseButton";
import { readPropertyWithServient } from "../../../services/form";
import { extractIndexFromId } from "../../../utils/strings";
import { getLocalStorage } from "../../../services/localStorage";
import { getErrorSummary } from "../../../utils/arrays";
import Settings, { SettingsData } from "../../App/Settings";
import { ChevronDown, ChevronUp } from "react-feather";

interface ErrorAllRequests {
  firstError: {
    id: string;
    message: string;
  };
  errorCount: number;
}

interface FormInteractionProps {
  filteredHeaders: { key: string; text: string }[];
  filteredRows: any[];
  allRequestResults: { [id: string]: { value: string; error: string } };
  setAllRequestResults: React.Dispatch<
    React.SetStateAction<{ [id: string]: { value: string; error: string } }>
  >;
  errorAllRequests: ErrorAllRequests;
  setErrorAllRequests: React.Dispatch<React.SetStateAction<ErrorAllRequests>>;
}

const FormInteraction: React.FC<FormInteractionProps> = ({
  filteredHeaders,
  filteredRows,
  allRequestResults,
  setAllRequestResults,
  errorAllRequests,
  setErrorAllRequests,
}) => {
  const context = useContext(ediTDorContext);
  const td: ThingDescription = context.parsedTD;

  const [isTestingAll, setIsTestingAll] = useState<boolean>(false);
  const [settingsData, setSettingsData] = useState<SettingsData>({
    northboundUrl: getLocalStorage("northbound") || "",
    southboundUrl: getLocalStorage("southbound") || "",
    pathToValue: getLocalStorage("valuePath") || "/",
  });

  const [instanceSectionExpanded, setInstanceSectionExpanded] = useState(true);
  const [gatewaySectionExpanded, setGatewaySectionExpanded] = useState(false);
  const [tableSectionExpanded, setTableSectionExpanded] = useState(false);
  const [savingSectionExpanded, setSavingSectionExpanded] = useState(false);

  const [testingExpanded, setTestingExpanded] = useState(true);

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
        <div className="overflow-hidden rounded-md bg-black bg-opacity-80">
          <div
            className="flex cursor-pointer items-center p-2 font-bold"
            onClick={() => setInstanceSectionExpanded(!instanceSectionExpanded)}
          >
            <ChevronDown
              size={16}
              className={`mr-2 transition-transform duration-200 ${instanceSectionExpanded ? "rotate-0" : "-rotate-90"}`}
            />
            <span className="flex-grow"> 2.1 Instance</span>
            {instanceSectionExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronUp size={16} />
            )}
          </div>

          {instanceSectionExpanded && (
            <div className="p-2 pt-0">
              <div className="mx-auto w-[70%]"></div>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-md bg-black bg-opacity-80">
          <div
            className="flex cursor-pointer items-center p-2 font-bold"
            onClick={() => setGatewaySectionExpanded(!gatewaySectionExpanded)}
          >
            <ChevronDown
              size={16}
              className={`mr-2 transition-transform duration-200 ${gatewaySectionExpanded ? "rotate-0" : "-rotate-90"}`}
            />
            <span className="flex-grow"> 2.2 Gateway</span>
            {gatewaySectionExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronUp size={16} />
            )}
          </div>

          {gatewaySectionExpanded && (
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

        <div className="overflow-hidden rounded-md bg-black bg-opacity-80">
          <div
            className="flex cursor-pointer items-center p-2 font-bold"
            onClick={() => setTableSectionExpanded(!tableSectionExpanded)}
          >
            <ChevronDown
              size={16}
              className={`mr-2 transition-transform duration-200 ${tableSectionExpanded ? "rotate-0" : "-rotate-90"}`}
            />
            <span className="flex-grow"> 2.3 Table</span>
            {tableSectionExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronUp size={16} />
            )}
          </div>

          {tableSectionExpanded && (
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

        <div className="overflow-hidden rounded-md bg-black bg-opacity-80">
          <div
            className="flex cursor-pointer items-center p-2 font-bold"
            onClick={() => setSavingSectionExpanded(!savingSectionExpanded)}
          >
            <ChevronDown
              size={16}
              className={`mr-2 transition-transform duration-200 ${savingSectionExpanded ? "rotate-0" : "-rotate-90"}`}
            />
            <span className="flex-grow"> 2.4 Saving results</span>
            {savingSectionExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronUp size={16} />
            )}
          </div>

          {savingSectionExpanded && (
            <div className="p-2 pt-0">
              <div className="mx-auto w-[70%]"></div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FormInteraction;
