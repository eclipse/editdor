/********************************************************************************
 * Copyright (c) 2018 - 2021 Contributors to the Eclipse Foundation
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
  useEffect,
  useImperativeHandle,
} from "react";
import ReactDOM from "react-dom";
import ediTDorContext from "../../context/ediTDorContext";
import { AdvancedOptions } from "./components/AdvancedOptions"
import { DialogTemplate } from "./DialogTemplate";

export const SaveTmRemotelyDialog = forwardRef((props, ref) => {
    const context = useContext(ediTDorContext);
    const [display, setDisplay] = React.useState(() => {
      return false;
    });

    useEffect(() => {
      if (display === true) {
      }
    }, [display, context]);

    useImperativeHandle(ref, () => {
      return {
        openModal: () => open(),
        close: () => close(),
      };
    });

    const open = () => {
      setDisplay(true);
    };

    const close = () => {
      setDisplay(false);
    };

    const checkForDuplicates = async (
      thingModel,
      credential
    ) => {
      const response = await performPostRequest(
        thingModel,
        credential,
        "models/is-duplicate"
      );
      if (!response.ok) return handleError(response);

      const isDuplicateString = await response.text();
      return isDuplicateString.toLowerCase() === "true";
    };

    const saveTm = async (thingModel, credential) => {
      const isDuplicate = await checkForDuplicates(
        thingModel,
        credential
      );
      let confirmation = false;
      if (isDuplicate) {
        const msg =
          "The Thing Model send already exist in the give repository. Do you want to save it regardless?";
        confirmation = window.confirm(msg);
      }
      if (!isDuplicate || confirmation) {
        const response = await performPostRequest(
          thingModel,
          credential
        );
        if (!response.ok) handleError(response);
      }
    };

    const handleError = (response) => {
      let msg;
      switch (response.status) {
        case 401:
          msg = "Invalid credentials provided";
          break;
        case 500:
          msg =
            "Thing model repository is having troubles processing your request";
          break;
        case 400:
          msg = "Invalid thing model provided";
          break;
        default:
          msg = `We ran into an error trying to save your TD.`;
      }
      return alert(msg);
    };

    const performPostRequest = async (
      thingModel,
      credential,
      path = "models"
    ) => {
      return await fetch(
        `${context.tmRepositoryUrl}/${path}`,
        {
          method: "POST",
          body: thingModel,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${credential}`,
          },
        }
      );
    };
    const changeUrl = async () =>{
      const url = document.getElementById("remote-url").value;
    try {
      //* is this the best way to check if this url is a valid thing model repository?
      await fetch(`${url}/models?limit=1`)
      context.updateTmRepositoryUrl(url);
    } catch (error) {
      const msg = `Error processing URL - Thing Model Repository was not found`;
      alert(msg);
    }


    }
    const urlField = createCredentialField(changeUrl);

    if (display) {
      return ReactDOM.createPortal(
        <DialogTemplate
          onCancel={close}
          cancelText={"Close"}
          onSubmit={() => {
            const credential = document.getElementById(
              "credential-field"
            ).value;
            if (credential === null) return;
            const thingModel = context.offlineTD;
            saveTm(thingModel, credential);
            close();
          }}
          children={urlField}
          title={"Create new TM"}
          description={
            "Create a new TM in the remote Thing Model Repository"
          }
        />,
        document.getElementById("modal-root")
      );
    }

    return null;
  }
);

const createCredentialField = (changeUrl) => {
  return (
    <div className="py-1">
      <AdvancedOptions
        changeUrl={changeUrl}
      />
      <label
        htmlFor="credential-field"
        className="text-sm text-gray-400 font-medium pl-2"
      >
        Credential:
      </label>
      <input
        type="text"
        name="credential-field"
        id="credential-field"
        className="border-gray-600 bg-gray-600 w-full p-2 sm:text-sm border-2 text-white rounded-md focus:outline-none focus:border-blue-500"
      />
    </div>
  );
};
