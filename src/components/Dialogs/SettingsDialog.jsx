/********************************************************************************
 * Copyright (c) 2018 - 2022 Contributors to the Eclipse Foundation
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
import React, { forwardRef, useImperativeHandle } from "react";
import ReactDOM from "react-dom";
import { getTargetUrl, setTargetUrl } from "../../services/targetUrl";
import { DialogTemplate } from "./DialogTemplate";

export const SettingsDialog = forwardRef((props, ref) => {
  const [display, setDisplay] = React.useState(false);
  const [settingsTargetUrl, setSettingsTargetUrl] = React.useState("");

  useImperativeHandle(ref, () => {
    return {
      openModal: () => open(),
      close: () => close(),
    };
  });

  const open = () => {
    setDisplay(true);

    setSettingsTargetUrl(getTargetUrl());
  };

  const close = () => {
    setDisplay(false);
  };

  let child = (
    <>
      <label className="pl-2 text-sm font-medium text-gray-400">
        Target URL:
      </label>
      <input
        type="text"
        name="settings-target-url-field"
        id="settings-target-url-field"
        className="w-full rounded-md border-2 border-gray-600 bg-gray-600 p-2 text-white focus:border-blue-500 focus:outline-none sm:text-sm"
        value={settingsTargetUrl}
        onChange={(e) => setSettingsTargetUrl(e.target.value)}
        placeholder="http://localhost:8080/"
      />
      <p className="pl-2 text-sm text-gray-400">
        The target url should point to a server that implements the Discovery
        Specifications's Things API. If a valid target url is provided, the
        ediTDor automatically uses it to save your changes. Empty this field to
        simply save files to disk.
      </p>
    </>
  );

  if (display) {
    return ReactDOM.createPortal(
      <DialogTemplate
        hasSubmit={true}
        onCancel={close}
        cancelText={"Cancel"}
        submitText={"Save Changes"}
        onSubmit={() => {
          setTargetUrl(settingsTargetUrl);
          close();
        }}
        children={child}
        title={"Settings"}
        description={
          "Change the ediTDors configuration to your needs. More configuration options are yet to come..."
        }
      />,
      document.getElementById("modal-root")
    );
  }

  return null;
});
