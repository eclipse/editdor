/********************************************************************************
 * Copyright (c) 2018 Contributors to the Eclipse Foundation
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
import React, { useCallback, useContext, useState, useEffect } from "react";
import {
  Download,
  File,
  FilePlus,
  FileText,
  Save,
  Settings,
  Share,
  Link,
} from "react-feather";
import editdorLogo from "../../assets/editdor.png";
import ediTDorContext from "../../context/ediTDorContext";
import * as fileTdService from "../../services/fileTdService";
import { getTargetUrl } from "../../services/localStorage";
import * as thingsApiService from "../../services/thingsApiService";
import { isThingModel } from "../../util";
import ConvertTmDialog from "../Dialogs/ConvertTmDialog";
import CreateTdDialog from "../Dialogs/CreateTdDialog";
import SettingsDialog from "../Dialogs/SettingsDialog";
import ShareDialog from "../Dialogs/ShareDialog";
import ContributeToCatalog from "../Dialogs/ContributeToCatalog";
import ErrorDialog from "../Dialogs/ErrorDialog";
import Button from "./Button";

const EMPTY_TM_MESSAGE =
  "To contribute a Thing Model, please first load a Thing Model to be validated.";
const INVALID_TYPE_MESSAGE =
  'To contribute a Thing Model, the TM must have the following pair key/value:  "@type": "tm:ThingModel"  ';

const AppHeader: React.FC = () => {
  const context = useContext(ediTDorContext);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorDisplay, setErrorDisplay] = useState<{
    state: boolean;
    message: string;
  }>({
    state: false,
    message: "",
  });
  const [saveToCatalog, setSaveToCatalog] = useState<boolean>(false);
  const [useNorthboundForInteractions, setUseNorthboundForInteractions] =
    useState<boolean>(false);

  const verifyDiscard = useCallback((): boolean => {
    if (!context.isModified) {
      return true;
    }

    const msg =
      "Discard changes? All changes you made to your TD will be lost.";
    return window.confirm(msg);
  }, [context.isModified]);

  const openFile = useCallback(async () => {
    if (!verifyDiscard()) {
      return;
    }

    try {
      const res = await fileTdService.readFromFile();

      const linkedFileName = `./${res.fileName}`;
      let linkedTd: Record<string, any> = {};
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
      setErrorDisplay({
        state: true,
        message: msg,
      });
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
      setErrorDisplay({
        state: true,
        message:
          "The TD is not valid JSON. Please fix the errors before saving.",
      });
      return;
    }

    setIsLoading(true);
    //TODO const targetUrl = getTargetUrl();
    const targetUrl = "";
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
        setErrorDisplay({
          state: true,
          message:
            "Didn't save TD. Please check if the provided target URL is correct and the intermediary / thing directory is working as intended.",
        });
        return;
      }
    }

    context.updateIsModified(false);
    setIsLoading(false);
  }, [context, saveToCatalog]);

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
      setErrorDisplay({
        state: true,
        message:
          "Didn't save TD. The action was either canceled or ran into an error.",
      });
    }
  }, [context]);

  const handleWithLoadingState = (func: () => Promise<any>) => {
    return async () => {
      setIsLoading(true);
      const res = await func();
      setIsLoading(false);

      //console.log(res);
      return res;
    };
  };

  useEffect(() => {
    const shortcutHandler = (e: KeyboardEvent) => {
      if (
        (window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) &&
        e.key === "s"
      ) {
        e.preventDefault();
        e.stopPropagation();
        handleWithLoadingState(save)();
      }
      if (
        (window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) &&
        e.key === "o"
      ) {
        e.preventDefault();
        e.stopPropagation();
        handleWithLoadingState(openFile)();
      }
      if (
        (window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) &&
        e.key === "n"
      ) {
        e.preventDefault();
        e.stopPropagation();
        handleOpenCreateTdDialog();
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

  const convertTmDialog = React.useRef<{
    openModal: () => void;
    close: () => void;
  }>(null);
  const handleOpenConvertTmDialog = () => {
    convertTmDialog.current?.openModal();
  };

  const shareDialog = React.useRef<{ openModal: () => void }>(null);
  const handleOpenShareDialog = () => {
    shareDialog.current?.openModal();
  };

  const createTdDialog = React.useRef<{ openModal: () => void }>(null);
  const handleOpenCreateTdDialog = () => {
    createTdDialog.current?.openModal();
  };

  const settingsDialog = React.useRef<{
    openModal: () => void;
    close: () => void;
  }>(null);

  const handleOpenSettingsDialog = () => {
    settingsDialog.current?.openModal();
  };

  const contributeToCatalog = React.useRef<{
    openModal: () => void;
    close: () => void;
  }>(null);

  const handleOpenContributeToCatalog = (): void => {
    if (!context.offlineTD) {
      setErrorDisplay({
        state: true,
        message: EMPTY_TM_MESSAGE,
      });
    } else if (!context.parsedTD["@type"]) {
      setErrorDisplay({
        state: true,
        message: INVALID_TYPE_MESSAGE,
      });
    } else if (context.validationMessage?.report.schema === "failed") {
      setErrorDisplay({
        state: true,
        message: `The Thing Model did not pass the JSON schema validation Please make sure the Thing Model is valid according to the JSON schema before contributing it to the catalog.`,
      });
    } else {
      contributeToCatalog.current?.openModal();
    }
  };

  const handleChangeOnSaveToCatalog = (value: boolean): void => {
    setSaveToCatalog(value);
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

          <Button onClick={handleOpenContributeToCatalog}>
            <Link />
            <div className="text-xs">Contribute to Catalog</div>
          </Button>

          <Button onClick={handleOpenShareDialog}>
            <Share />
            <div className="text-xs">Share</div>
          </Button>

          <div className="hidden md:block">
            <Button onClick={handleWithLoadingState(save)}>
              <Save />
              <div className="text-xs">Save</div>
            </Button>
          </div>

          <div className="hidden md:block">
            <Button onClick={handleWithLoadingState(openFile)}>
              <File />
              <div className="text-xs">Open</div>
            </Button>
          </div>

          <Button onClick={handleOpenCreateTdDialog}>
            <FilePlus />
            <div className="text-xs">Create</div>
          </Button>

          {isThingModel(context.parsedTD) && (
            <Button onClick={handleOpenConvertTmDialog}>
              <FileText />
              <div className="text-xs">To TD</div>
            </Button>
          )}

          <Button onClick={handleWithLoadingState(createNewFile)}>
            <Download />
            <div className="text-xs">Download</div>
          </Button>

          <Button onClick={handleOpenSettingsDialog}>
            <Settings />
            <div className="text-xs">Settings</div>
          </Button>
        </div>
      </header>

      <ConvertTmDialog ref={convertTmDialog} />
      <ShareDialog ref={shareDialog} />
      <CreateTdDialog ref={createTdDialog} />
      <SettingsDialog
        ref={settingsDialog}
        saveToCatalog={saveToCatalog}
        handleChangeOnSaveToCatalog={handleChangeOnSaveToCatalog}
        useNorthboundForInteractions={useNorthboundForInteractions}
        handleChangeOnUseNorthboundForInteractions={
          setUseNorthboundForInteractions
        }
      />
      <ContributeToCatalog ref={contributeToCatalog} />
      <ErrorDialog
        isOpen={errorDisplay.state}
        onClose={() => setErrorDisplay({ state: false, message: "" })}
        errorMessage={errorDisplay.message}
      />

      <input
        className="h-0"
        type="file"
        id="fileInput"
        style={{ display: "none" }}
      />
      <a className="h-0" id="aDownload" href="/" style={{ display: "none" }} />
    </>
  );
};

export default AppHeader;
