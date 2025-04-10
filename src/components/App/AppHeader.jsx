/********************************************************************************
 * Copyright (c) 2018 - 2024 Contributors to the Eclipse Foundation
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
import {
  Download,
  File,
  FilePlus,
  FileText,
  Save,
  Settings,
  Share,
} from "react-feather";
import editdorLogo from "../../assets/editdor.png";
import ediTDorContext from "../../context/ediTDorContext";
import * as fileTdService from "../../services/fileTdService";
import { getTargetUrl } from "../../services/targetUrl";
import * as thingsApiService from "../../services/thingsApiService";
import { isThingModel } from "../../util";
import { ConvertTmDialog } from "../Dialogs/ConvertTmDialog";
import { CreateTdDialog } from "../Dialogs/CreateTdDialog";
import { SettingsDialog } from "../Dialogs/SettingsDialog";
import { ShareDialog } from "../Dialogs/ShareDialog";

export default function AppHeader() {
  const context = useContext(ediTDorContext);
  const [isLoading, setIsLoading] = React.useState(false);

  const verifyDiscard = useCallback(() => {
    if (!context.isModified) {
      return true;
    }

    const msg =
      "Discard changes? All changes you made to your TD will be lost.";
    return window.confirm(msg);
  }, [context.isModified]);

  /**
   *
   * @param {*} _
   *
   * Open File from Filesystem
   */
  const openFile = useCallback(async () => {
    if (!verifyDiscard()) {
      return;
    }

    try {
      const res = await fileTdService.readFromFile();

      const linkedFileName = `./${res.fileName}`;
      let linkedTd = {};
      linkedTd[linkedFileName] = res.fileHandle
        ? res.fileHandle
        : JSON.parse(res.td);

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

  /**
   * @description
   * *save* tries to save the TD/TM via some intermediary or thing directory,
   * which supports the Things API (https://www.w3.org/TR/wot-discovery/#exploration-directory-api-things).
   *
   * If there is no endpoint to such a Things API defined, it falls back to
   * simply downloading it.
   */
  const save = useCallback(async () => {
    const td = context.parsedTD;

    if (!context.isValidJSON) {
      return alert(
        "Didn't save TD. The given TD can't even be parsed into a JSON object."
      );
    }

    setIsLoading(true);
    const targetUrl = getTargetUrl();
    if (targetUrl === "") {
      // no target url provided, save to file
      const fileHandle = await fileTdService.saveToFile(
        context.name,
        context.fileHandle,
        context.offlineTD
      );
      context.setFileHandle(fileHandle ?? context.fileHandle);
    } else {
      // target url provided, try to save it through the Things API
      try {
        if (td.id) {
          thingsApiService.createThing(td, targetUrl);
        } else {
          thingsApiService.createAnonymousThing(td, targetUrl);
        }
      } catch (error) {
        console.debug(error);
        alert(
          "Didn't save TD. Please check if the provided target URL is correct and the intermediary / thing directory is working as intended."
        );
        return;
      }
    }

    context.updateIsModified(false);
    setIsLoading(false);
  }, [context]);

  const createNewFile = useCallback(async () => {
    try {
      const fileHandle = await fileTdService.saveToFile(
        context.name,
        undefined,
        context.offlineTD
      );
      context.setFileHandle(fileHandle ?? context.fileHandle);
      context.updateIsModified(false);
    } catch (error) {
      console.debug(error);
      alert(
        "Didn't save TD. The action was either canceled or ran into an error."
      );
    }
  }, [context]);

  const loadingCall = (func) => {
    return async () => {
      setIsLoading(true);
      const res = await func();
      setIsLoading(false);

      console.log(res);
      return res;
    };
  };

  useEffect(() => {
    const shortcutHandler = (e) => {
      if (
        (window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) &&
        e.key === "s"
      ) {
        e.preventDefault();
        e.stopPropagation();
        loadingCall(save)();
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
      var message =
        "Important: Please click on 'Save' button to leave this page.";
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
  }, [openFile, save]);

  const convertTmDialog = React.useRef();
  const openConvertTmDialog = () => {
    convertTmDialog.current.openModal();
  };

  const shareDialog = React.useRef();
  const openShareDialog = () => {
    shareDialog.current.openModal();
  };

  const createTdDialog = React.useRef();
  const openCreateTdDialog = () => {
    createTdDialog.current.openModal();
  };

  const settingsDialog = React.useRef();
  const openSettingsDialog = () => {
    settingsDialog.current.openModal();
  };

  return (
    <>
      <header className="flex h-14 items-center justify-between bg-blue-500">
        <div className="flex items-center">
          <button
            className="ml-4"
            onClick={() =>
              window.open("https://eclipse.github.io/editdor/", "_blank")
            }
          >
            <img className="min-w-36 max-w-36" src={editdorLogo} alt="LOGO" />
          </button>
        </div>

        <div className="flex items-center gap-4 pr-2">
          {isLoading && <div className="app-header-spinner hidden md:block" />}

          <AppHeaderButton onClick={openShareDialog}>
            <Share />
            <div className="text-xs">Share</div>
          </AppHeaderButton>

          <div className="hidden md:block">
            <AppHeaderButton onClick={loadingCall(save)}>
              <Save />
              <div className="text-xs">Save</div>
            </AppHeaderButton>
          </div>

          <div className="hidden md:block">
            <AppHeaderButton onClick={loadingCall(openFile)}>
              <File />
              <div className="text-xs">Open</div>
            </AppHeaderButton>
          </div>

          <AppHeaderButton onClick={openCreateTdDialog}>
            <FilePlus />
            <div className="text-xs">Create</div>
          </AppHeaderButton>

          {isThingModel(context.parsedTD) && (
            <AppHeaderButton onClick={openConvertTmDialog}>
              <FileText />
              <div className="text-xs">To TD</div>
            </AppHeaderButton>
          )}

          <AppHeaderButton onClick={loadingCall(createNewFile)}>
            <Download />
            <div className="text-xs">Download</div>
          </AppHeaderButton>

          <AppHeaderButton onClick={openSettingsDialog}>
            <Settings />
            <div className="text-xs">Settings</div>
          </AppHeaderButton>
        </div>
      </header>

      <ConvertTmDialog ref={convertTmDialog} />
      <ShareDialog ref={shareDialog} />
      <CreateTdDialog ref={createTdDialog} />
      <SettingsDialog ref={settingsDialog} />
      <input
        className="h-0"
        type="file"
        id="fileInput"
        style={{ display: "none" }}
      />
      <a className="h-0" id="aDownload" href="/" style={{ display: "none" }} />
    </>
  );
}

function AppHeaderButton(props) {
  return (
    <button
      className="min-w-8 text-white hover:opacity-50"
      onClick={props.onClick}
    >
      <div className="flex flex-col items-center justify-center gap-0.5">
        {props.children}
      </div>
    </button>
  );
}
