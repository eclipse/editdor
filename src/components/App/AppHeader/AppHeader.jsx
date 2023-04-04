/********************************************************************************
 * Copyright (c) 2018 - 2020 Contributors to the Eclipse Foundation
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
import React, { useCallback, useContext, useEffect } from "react";
import editdorLogo from "../../../assets/editdor.png";
import "../../../assets/main.css";
import wotLogo from "../../../assets/WoT.png";
import ediTDorContext from "../../../context/ediTDorContext";
import * as fileTdService from "../../../services/fileTdService";
import { ConvertTmDialog } from "../../Dialogs/ConvertTmDialog";
import { CreateTdDialog } from "../../Dialogs/CreateTdDialog";
import { ShareDialog } from "../../Dialogs/ShareDialog";
import Button from "./Button";

export default function AppHeader() {
  const context = useContext(ediTDorContext);
  const [isLoading, setIsLoading] = React.useState(false);

  const verifyDiscard = useCallback(() => {
    if (!context.isModified) {
      return true;
    }

    const msg = "Discard changes? All changes you made to your TD will be lost.";
    return window.confirm(msg);
  }, [context.isModified]);

  /**
   *
   * @param {*} _
   *
   * Open File from Filesystem
   */
  const openFile = useCallback(async () => {
    if (!(verifyDiscard())) {
      return;
    }

    try {
      const res = await fileTdService.readFromFile();

      const linkedFileName = `./${res.fileName}`;
      let linkedTd = {};
      linkedTd[linkedFileName] = res.fileHandle ? res.fileHandle : JSON.parse(res.td)

      context.updateOfflineTD(res.td);
      context.updateIsModified(false);

      context.setFileHandle(res.fileHandle || res.fileNname);
      context.updateLinkedTd(undefined);
      context.addLinkedTd(linkedTd);
    } catch (error) {
      const msg = "Opening a new TD was canceled or an error occured.";
      console.error(msg, error);
      alert(msg);
    }
  }, [context, verifyDiscard]);

  const saveFile = useCallback(async () => {
    let td;
    try {
      td = JSON.parse(context.offlineTD);
    } catch (error) {
      return alert("Didn't save TD. The given TD can't be parsed into a JSON object.");
    }

    try {
      const fileHandle = await fileTdService.saveToFile(context.name, context.fileHandle, context.offlineTD);
      context.setFileHandle(fileHandle ?? context.fileHandle);

      context.updateIsModified(false);
    } catch (error) {
      console.debug(error);
      alert("Didn't save TD. The action was either canceled or ran into an error.");
    }
  }, [context]);

  const createNewFile = useCallback(async () => {
    try {
      const fileHandle = await fileTdService.saveToFile(context.name, undefined, context.offlineTD);
      context.setFileHandle(fileHandle ?? context.fileHandle);
      context.updateIsModified(false);
    } catch (error) {
      console.debug(error);
      alert("Didn't save TD. The action was either canceled or ran into an error.");
    }
  }, [context]);

  const loadingCall = (func) => {
    return async () => {
      setIsLoading(true);
      await func();
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const shortcutHandler = (e) => {
      if (
        (window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) &&
        e.key === "s"
      ) {
        e.preventDefault();
        e.stopPropagation();
        loadingCall(saveFile)();
      }
      if (
        (window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) &&
        e.key === "o"
      ) {
        e.preventDefault();
        e.stopPropagation();
        loadingCall(openFile)();
      }
      if (
        (window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) &&
        e.key === "n"
      ) {
        e.preventDefault();
        e.stopPropagation();
        openCreateTdDialog();
      }
    };

    // Adding Eventlistener for shortcuts
    document.addEventListener("keydown", shortcutHandler, false);
    window.onbeforeunload = function (event) {
      var message = "Important: Please click on 'Save' button to leave this page.";
      if (typeof event == "undefined") {
        event = window.event;
      }
      if (event) {
        event.returnValue = message;
      }
      return message;
    };
    return () => {
      //Remove Eventlistener for shortcuts before unmounting component
      document.removeEventListener("keydown", shortcutHandler, false);
    };
  }, [openFile, saveFile]);

  const convertTmDialog = React.useRef();
  const openConvertTmDialog = () => { convertTmDialog.current.openModal(); };

  const shareDialog = React.useRef();
  const openShareDialog = () => { shareDialog.current.openModal(); };

  const createTdDialog = React.useRef();
  const openCreateTdDialog = () => { createTdDialog.current.openModal(); };

  /**
   * @param {Object} td
   * @returns {boolean}
   */
  function isThingModel(td) {
    try {
      td = JSON.parse(td);
    } catch {
      return false;
    }

    if (!td.hasOwnProperty("@type")) {
      return false;
    }

    return td["@type"].indexOf("tm:ThingModel") > -1;
  }

  return (
    <>
      <header className="flex justify-between items-center h-16 bg-blue-500">
        <div className="flex items-center">
          <img className="pl-2 h-12" src={wotLogo} alt="WOT" />
          <div className="w-2"></div>
          <button>
            <img
              className="pl-2 h-8"
              src={editdorLogo}
              alt="LOGO"
              onClick={() =>
                window.open("https://eclipse.github.io/editdor/", "_blank")
              }
            />
          </button>
        </div>
        <div className="flex space-x-2 pr-2 items-center">
          {isLoading && <div className="app-header-spinner" />}
          <Button onClick={openShareDialog}>Share</Button>
          <Button onClick={openCreateTdDialog}>New</Button>
          <Button onClick={loadingCall(openFile)}>Open</Button>
          <Button onClick={loadingCall(saveFile)}>Save</Button>
          <Button onClick={loadingCall(createNewFile)}>Persist As File</Button>
          {isThingModel(context.offlineTD) && (
            <Button onClick={openConvertTmDialog}>Convert To TD</Button>
          )}
        </div>
      </header>
      <ConvertTmDialog ref={convertTmDialog} />
      <ShareDialog ref={shareDialog} />
      <CreateTdDialog ref={createTdDialog} />
      <input
        className="h-0"
        type="file"
        id="fileInput"
        style={{ display: "none" }}
      ></input>
      <a className="h-0" id="aDownload" href="/" style={{ display: "none" }}>
        download
      </a>
    </>
  );
}
