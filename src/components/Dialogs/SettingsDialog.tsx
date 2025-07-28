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
import React, { forwardRef, useImperativeHandle, useState } from "react";
import ReactDOM from "react-dom";
import { getTargetUrl, setTargetUrl } from "../../services/smartConnector";
import DialogTemplate from "./DialogTemplate";
import InfoIconWrapper from "../../components/InfoIcon/InfoIconWrapper";

export interface SettingsDialogRef {
  openModal: () => void;
  close: () => void;
}

const SettingsDialog = forwardRef<SettingsDialogRef>((_, ref) => {
  const [display, setDisplay] = useState<boolean>(false);
  const [northboundUrl, setNorthboundUrl] = useState<string>("");
  const [southboundUrl, setSouthboundUrl] = useState<string>("");

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
  };

  const close = () => {
    setDisplay(false);
  };

  let child = (
    <>
      <div className="flex flex-row items-center justify-start">
        <h1 className="flex-grow text-xl font-bold">Gateway Configuration</h1>
      </div>
      <h2 className="py-2 pl-2 text-gray-400">
        If you want to interact with non-HTTP devices via a gateway, you can
        send it TDs to its southbound endpoint with a "POST" request. Similarly,
        you can retrieve TDs from its northbound endpoint. The id of the initial
        TD is used to correlate both
      </h2>
      <div className="flex items-center">
        <label className="py-2 text-sm font-medium text-gray-400">
          <InfoIconWrapper
            tooltip={{
              html: "The target URL northbound should point to a server that implements the Discovery Specifications's Things API. If a valid target URL is provided, the ediTDor automatically uses it to save your changes. Empty this field to simply save files to disk.",
              href: "",
            }}
            id="settings-target-url-northbound-info"
            children={"Target URL Northbound:"}
          ></InfoIconWrapper>
        </label>
      </div>
      <input
        type="text"
        name="settings-target-url-field-northbound"
        id="settings-target-url-field-northbound"
        className="w-full rounded-md border-2 border-gray-600 bg-gray-600 p-2 text-white focus:border-blue-500 focus:outline-none sm:text-sm"
        value={northboundUrl}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setNorthboundUrl(e.target.value)
        }
        placeholder="http://localhost:8080/"
      />

      <div className="flex items-center">
        <label className="py-2 text-sm font-medium text-gray-400">
          <InfoIconWrapper
            tooltip={{
              html: "The target URL southbound",
              href: "",
            }}
            id="settings-target-url-southbound-info"
            children={"Target URL Southbound:"}
          ></InfoIconWrapper>
        </label>
      </div>
      <input
        type="text"
        name="settings-target-url-field-southbound"
        id="settings-target-url-field-southbound"
        className="w-full rounded-md border-2 border-gray-600 bg-gray-600 p-2 text-white focus:border-blue-500 focus:outline-none sm:text-sm"
        value={southboundUrl}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSouthboundUrl(e.target.value)
        }
        placeholder="http://localhost:8080/"
      />
      <p className="mb-2 pl-2 text-sm text-gray-400">
        The target url southbound should point to a server that implements the
        Discovery Specifications's Things API. If a valid target url is
        provided, the ediTDor automatically uses it to save your changes. Empty
        this field to simply save files to disk.
      </p>
    </>
  );

  const handleSubmit = () => {
    setTargetUrl(northboundUrl, "northbound");
    setTargetUrl(southboundUrl, "southbound");
    close();
  };

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
        description={
          "Change the ediTDors configuration to your needs. More configuration options are yet to come..."
        }
      />,
      document.getElementById("modal-root") as HTMLElement
    );
  }

  return null;
});
SettingsDialog.displayName = "SettingsDialog";
export default SettingsDialog;
