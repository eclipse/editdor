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
  useImperativeHandle,
  useState,
  useCallback,
} from "react";
import ReactDOM from "react-dom";
import { getTargetUrl, setTargetUrl } from "../../services/localStorage";
import DialogTemplate from "./DialogTemplate";
import InfoIconWrapper from "../../components/InfoIcon/InfoIconWrapper";
import DialogTextField from "./base/DialogTextField";
import { isValidUrl } from "../../utils/strings";

export interface SettingsDialogRef {
  openModal: () => void;
  close: () => void;
}

interface SettingsDialogProps {
  saveToCatalog: boolean;
  handleChangeOnSaveToCatalog: (value: boolean) => void;
  useNorthboundForInteractions: boolean;
  handleChangeOnUseNorthboundForInteractions: (value: boolean) => void;
}

const SettingsDialog = forwardRef<SettingsDialogRef, SettingsDialogProps>(
  (
    {
      saveToCatalog,
      handleChangeOnSaveToCatalog,
      useNorthboundForInteractions,
      handleChangeOnUseNorthboundForInteractions,
    },
    ref
  ) => {
    const [display, setDisplay] = useState<boolean>(false);
    const [northboundUrl, setNorthboundUrl] = useState<string>("");
    const [southboundUrl, setSouthboundUrl] = useState<string>("");
    const [pathToValue, setPathToValue] = useState<string>("/");
    const [southboundUrlError, setSouthboundUrlError] = useState<string>("");
    const [northboundUrlError, setNorthboundUrlError] = useState<string>("");
    const [pathToValueError, setPathToValueError] = useState<string>("");

    useImperativeHandle(ref, () => {
      return {
        openModal: () => open(),
        close: () => close(),
      };
    });

    const open = () => {
      setDisplay(true);
      setNorthboundUrl(getTargetUrl("northbound"));
      setSouthboundUrl(getTargetUrl("southbound"));
      setPathToValue(getTargetUrl("valuePath"));
    };

    const close = async () => {
      setDisplay(false);
    };

    const handleSubmit = () => {
      setTargetUrl(northboundUrl, "northbound");
      setTargetUrl(southboundUrl, "southbound");
      setTargetUrl(pathToValue, "valuePath");
      close();
    };

    const handleSouthboundUrlChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSouthboundUrl(value);

        if (value === "") {
          setSouthboundUrlError("");
        } else if (!isValidUrl(value)) {
          setSouthboundUrlError(
            "Please enter a valid URL (e.g., http://localhost:8080)"
          );
        } else {
          setSouthboundUrlError("");
        }
      },
      [setSouthboundUrl, setSouthboundUrlError]
    );
    const handleNorthboundUrlChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNorthboundUrl(value);

        if (value === "") {
          setNorthboundUrlError("");
        } else if (!isValidUrl(value)) {
          setNorthboundUrlError(
            "Please enter a valid URL (e.g., http://localhost:8080)"
          );
        } else {
          setNorthboundUrlError("");
        }
      },
      [setNorthboundUrl, setNorthboundUrlError]
    );
    const handlePathToValueChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (value === "") {
          setPathToValue(value);
          setPathToValueError("");
        } else if (!value.startsWith("/")) {
          setPathToValueError("Path must start with '/'");
        } else if (value.includes(" ")) {
          setPathToValueError("Path cannot contain spaces");
        } else {
          setPathToValue(value);
          setPathToValueError("");
        }
      },
      [setPathToValue, setPathToValueError]
    );

    let child = (
      <>
        <div className="rounded-md bg-black bg-opacity-80 p-2">
          <h1 className="font-bold">Third Party Service Configuration</h1>
          <div className="px-4">
            <h2 className="py-2 text-justify text-gray-400">
              If you want to interact with non-HTTP devices via a gateway, you
              can send it TDs to its southbound endpoint with a "POST" request.
              Similarly, you can retrieve TDs from its northbound endpoint. The
              id of the initial TD is used to correlate both.
            </h2>

            <DialogTextField
              label={
                <InfoIconWrapper
                  tooltip={{
                    html: "The target URL northbound should point to a server that implements the Discovery Specifications's Things API. If a valid target URL is provided, the ediTDor automatically uses it to save your changes. Empty this field to simply save files to disk.",
                    href: "",
                  }}
                  id="settings-target-url-northbound-info"
                  children={"Target URL Northbound:"}
                />
              }
              placeholder="e.g.: http://localhost:8080/"
              id="settings-target-url-field-northbound"
              type="text"
              value={northboundUrl}
              autoFocus={false}
              onChange={handleNorthboundUrlChange}
              className={`${
                northboundUrlError ? "border-red-500" : "border-gray-600"
              } w-full rounded-md border-2 bg-gray-600 p-2 text-white focus:border-blue-500 focus:outline-none sm:text-sm`}
            />
            {northboundUrlError && (
              <div className="mt-1 text-sm text-red-500">
                {northboundUrlError}
              </div>
            )}

            <DialogTextField
              label={
                <InfoIconWrapper
                  tooltip={{
                    html: "The target URL southbound",
                    href: "",
                  }}
                  id="settings-target-url-southbound-info"
                  children={"Target URL Southbound:"}
                />
              }
              placeholder="e.g.: http://localhost:8080/"
              id="settings-target-url-field-southbound"
              type="text"
              value={southboundUrl}
              autoFocus={false}
              onChange={handleSouthboundUrlChange}
              className={`${
                southboundUrlError ? "border-red-500" : "border-gray-600"
              } w-full rounded-md border-2 bg-gray-600 p-2 text-white focus:border-blue-500 focus:outline-none sm:text-sm`}
            />
            {southboundUrlError && (
              <div className="mt-1 text-sm text-red-500">
                {southboundUrlError}
              </div>
            )}
          </div>
        </div>

        <div className="my-4 rounded-md bg-black bg-opacity-80 p-2">
          <h1 className="font-bold">Path to value</h1>
          <div className="px-4">
            <h2 className="py-2 text-justify text-gray-400">
              {`If the gateway is wrapping the payloads in a JSON object, please provide the path to the value as a JSON pointer. For a JSON like {"foo": {"bar":"baz"}}, where baz is the value according the Data Schema of the TD, you should enter /foo/bar.`}
            </h2>

            <DialogTextField
              label={
                <InfoIconWrapper
                  tooltip={{
                    html: "JSON pointer path to the actual value in wrapped payloads. Use forward slashes to navigate nested objects.",
                    href: "",
                  }}
                  id="settingsPathToValueInfo"
                  children={"JSON Pointer Path:"}
                />
              }
              placeholder="/foo/bar"
              id="settingsPathToValueField"
              type="text"
              value={pathToValue}
              autoFocus={false}
              onChange={handlePathToValueChange}
              className={`${
                pathToValueError ? "border-red-500" : "border-gray-600"
              } w-full rounded-md border-2 bg-gray-600 p-2 text-white focus:border-blue-500 focus:outline-none sm:text-sm`}
            />
            {pathToValueError && (
              <div className="mt-1 text-sm text-red-500">
                {pathToValueError}
              </div>
            )}
          </div>
        </div>

        <div className="my-4 rounded-md bg-black bg-opacity-80 p-2">
          <h1 className="font-bold">Destination save</h1>
          <div className="px-4">
            <h2 className="py-1 pl-2 text-justify text-gray-400">
              Controls the destination of the TDs when saving them.
            </h2>
            <div className="flex flex-row pl-2">
              <input
                id="destination"
                type="checkbox"
                checked={saveToCatalog}
                onChange={() => handleChangeOnSaveToCatalog(!saveToCatalog)}
              />
              <label className="form-checkbox-label pl-2 text-gray-400">
                <InfoIconWrapper
                  tooltip={{
                    html: "If checked, the TDs will be saved to the catalog. If unchecked, they will be saved to the local file system.",
                    href: "",
                  }}
                  id="settingsPathToValueInfo"
                  children={"Save TDs to the catalog"}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="my-4 rounded-md bg-black bg-opacity-80 p-2">
          <h1 className="font-bold">Table view Properties</h1>
          <div className="px-4">
            <h2 className="py-1 pl-2 text-justify text-gray-400">
              Controls the way the read of properties will be done.
            </h2>
            <div className="flex flex-row pl-2">
              <input
                id="useNorthbound"
                type="checkbox"
                checked={useNorthboundForInteractions}
                onChange={() =>
                  handleChangeOnUseNorthboundForInteractions(
                    !useNorthboundForInteractions
                  )
                }
              />
              <label className="form-checkbox-label pl-2 text-gray-400">
                <InfoIconWrapper
                  tooltip={{
                    html: "If checked, when checking the properties in the view Table, the northbound TD will be used to read values.",
                    href: "",
                  }}
                  id="settingsUseNorthboundInfo"
                  children={"Use northbound TD for interactions"}
                />
              </label>
            </div>
          </div>
        </div>
      </>
    );

    if (display) {
      return ReactDOM.createPortal(
        <DialogTemplate
          hasSubmit={true}
          onCancel={close}
          cancelText={"Cancel"}
          submitText={"Save Changes"}
          onSubmit={handleSubmit}
          children={child}
          title={"Settings"}
          description={"Change the ediTDors configuration to your needs"}
        />,
        document.getElementById("modal-root") as HTMLElement
      );
    }

    return null;
  }
);
SettingsDialog.displayName = "SettingsDialog";
export default SettingsDialog;
