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
import logo from "../../../assets/editdor.png";
import wot from "../../../assets/WoT.png";
import ediTDorContext from "../../../context/ediTDorContext";
import "../../../assets/main.css";
import "./Button.js";
import Button from "./Button.js";
import CreateNewTD from "./CreateNewTD.js";
import Swal from "sweetalert2";

export default function AppHeader() {
  const context = useContext(ediTDorContext);
  const [showModal, setShowModal] = React.useState(false);
  const [htmlPlaceholders, sethtmlPlaceholders] = React.useState([]);

  /**
   * Check if the Browser Supports the new Native File System Api (Chromium 86.0)
   */
  const hasNativeFS = useCallback(() => {
    return (
      "chooseFileSystemEntries" in window || "showOpenFilePicker" in window
    );
  }, []);

  const verifyDiscard = useCallback(async () => {
    if (!context.isModified) {
      return true;
    }

    console.log("verifyDiscard", context.isModified);
    const msg =
      "Discard changes? All changes you made to your TD will be lost.";
    return await window.confirm(msg);
  }, [context.isModified]);

  /**
   *
   * @param {*} file
   *
   * Read file content
   */
  const read = useCallback((file) => {
    return file.text ? file.text() : _readFileHTML5(file);
  }, []);

  const readFile = useCallback(
    async (file, fileHandle) => {
      try {
        context.updateOfflineTD(await read(file));
        context.setFileHandle(fileHandle || file.name);
        context.updateIsModified(false);
      } catch (ex) {
        const msg = `An error occured reading ${context.offlineTD}`;
        console.error(msg, ex);
        //TODO: Replace with SweetAlert2
        alert(msg);
      }
    },
    [context, read]
  );

  /**
   *
   * @param {*} _
   *
   * Open File from Filesystem
   */
  const openFile = useCallback(
    async (_) => {
      if (!(await verifyDiscard())) {
        return;
      }

      if (!hasNativeFS()) {
        const file = await getFileHTML5();
        if (file) {
          await readFile(file);
        }
        return;
      }

      let fileHandle;
      try {
        fileHandle = await getFileHandle();
        const file = await fileHandle.getFile();
        await readFile(file, fileHandle);
      } catch (ex) {
        const msg = "We ran into an error trying to open your TD.";
        console.error(msg, ex);
        alert(msg);
      }
    },
    [readFile, verifyDiscard, hasNativeFS]
  );

  const writeFile = useCallback(
    async (fileHandle, contents) => {
      if (fileHandle.createWriter) {
        const writer = await fileHandle.createWriter();
        await writer.write(0, contents);
        await writer.close();
        return;
      }

      const writable = await fileHandle.createWritable();
      await writable.write(contents);
      await writable.close();

      // refresh td for rendered view
      setTimeout(() => {
        context.updateOfflineTD(contents, "AppHEader");
        context.updateIsModified(false);
      }, 500);
    },
    [context]
  );

  const saveAsHTML5 = useCallback((filename, contents) => {
    const aDownload = document.getElementById("aDownload");
    filename = filename || "untitled.txt";
    const opts = { type: "text/plain" };
    const file = new File([contents], "", opts);
    aDownload.href = window.URL.createObjectURL(file);
    aDownload.setAttribute("download", filename);
    aDownload.click();
  }, []);

  const saveFileAsTD = () => {
    try {
      let regex = /{{/gi,
        result,
        startIindices = [];
      while ((result = regex.exec(context.offlineTD))) {
        startIindices.push(result.index);
      }
      regex = /}}/gi;
      let endIndices = [];
      while ((result = regex.exec(context.offlineTD))) {
        endIndices.push(result.index);
      }
      let placeholders = [];
      for (let i = 0; i < startIindices.length; i++) {
        placeholders.push(
          context.offlineTD.slice(startIindices[i] + 2, endIndices[i])
        );
      }
      placeholders = [...new Set(placeholders)];
      const htmlPlaceholdersTMP = placeholders.map((holder) => {
        return (
          <div key={holder} className="py-1">
            <label htmlFor={holder} className="text-sm text-gray-400 font-medium pl-2">
              {holder}:
            </label>
            <input
              type="text"
              name={holder}
              id={holder}
              className="border-gray-600 bg-gray-600 w-full p-2 sm:text-sm border text-white rounded-md"
              placeholder="Enter a value..."
            />
          </div>
        );
      });
      sethtmlPlaceholders(htmlPlaceholdersTMP);
      setShowModal(true);
    } catch (e) {}
  };

  const saveTMasTD = () => {
    let mappingObject = {}
    htmlPlaceholders.forEach((y) => {
        const elem = document.getElementById(y.key)
        mappingObject[y.key] = elem.value
        return elem.value
    });
    let JSONResult = context.offlineTD;
    Object.keys(mappingObject).forEach(key => {
        JSONResult = JSONResult.split(`{{${key}}}`).join(mappingObject[key]) 
    })
    const parse = JSON.parse(JSONResult);
    const permalink = `${window.location.href}?td=${encodeURI(JSON.stringify(parse))}`
    window.open(permalink, "_blank");
  }

  const saveFileAs = useCallback(async () => {
    if (!hasNativeFS()) {
      saveAsHTML5(context.name, context.offlineTD);
      return;
    }

    let fileHandle;
    try {
      fileHandle = await getNewFileHandle();
    } catch (ex) {
      const msg = "We ran into an error trying to save your TD.";
      console.error(msg, ex);
      return alert(msg);
    }

    try {
      await writeFile(fileHandle, context.offlineTD);
      context.setFileHandle(fileHandle);
      context.updateIsModified(false);
    } catch (ex) {
      const msg = "Unfortunately we were unable to save your TD.";
      console.error(msg, ex);
      alert(msg);
    }
  }, [saveAsHTML5, hasNativeFS, context, writeFile]);

  const newFile = useCallback(async () => {
    const thing = await CreateNewTD();
    if (thing) {
      context.updateOfflineTD(JSON.stringify(thing, null, "\t"), "AppHEader");
    }
  }, [context]);

  const saveFile = useCallback(async () => {
    try {
      if (!context.fileHandle) {
        return await saveFileAs();
      }
      await writeFile(context.fileHandle, context.offlineTD);
    } catch (ex) {
      const msg = "Unfortunately we were unable to save your TD.";
      console.error(msg, ex);
      alert(msg);
    }
  }, [context, saveFileAs, writeFile]);

  /**
   * Reading files with HTML5 input
   */
  const getFileHTML5 = async () => {
    return new Promise((resolve, reject) => {
      const fileInput = document.getElementById("fileInput");
      fileInput.onchange = (e) => {
        const file = fileInput.files[0];
        if (file) {
          return resolve(file);
        }
        return reject(new Error("AbortError"));
      };
      fileInput.click();
    });
  };

  /**
   * File Handle from native filesystem api
   * Only JSON/JSON+LD Files are supported
   */
  const getFileHandle = () => {
    const opts = {
      types: [
        {
          description: "Thing Description",
          accept: { "application/ld+json": [".jsonld", ".json"] },
        },
      ],
    };
    if ("showOpenFilePicker" in window) {
      return window.showOpenFilePicker(opts).then((handles) => handles[0]);
    }
    return window.chooseFileSystemEntries();
  };

  const getNewFileHandle = async () => {
    // new file system api
    if ("showSaveFilePicker" in window) {
      const opts = {
        types: [
          {
            description: "Thing Description",
            accept: { "application/ld+json": [".jsonld", ".json"] },
          },
        ],
      };

      return await window.showSaveFilePicker(opts);
    }

    // old html file input
    const opts = {
      type: "save-file",
      accepts: [
        {
          description: "Thing Description",
          extensions: [".jsonld", ".json"],
          mimeTypes: ["application/ld+json"],
        },
      ],
    };

    return await window.chooseFileSystemEntries(opts);
  };

  const _readFileHTML5 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("loadend", (event) => {
        const text = event.srcElement.result;
        return resolve(text);
      });
      reader.readAsText(file);
    });
  };

  const createPermalink = () => {
    const parse = JSON.parse(context.offlineTD);
    const permalink = `${window.location.href}?td=${encodeURI(
      JSON.stringify(parse)
    )}`;
    navigator.clipboard.writeText(permalink).then(
      function () {
        console.log("Async: Copying to clipboard was successful!");
      },
      function (err) {
        console.error("Async: Could not copy text: ", err);
      }
    );
    Swal.fire({
      title: "Permalink",
      input: "text",
      inputLabel: "The link was copied to your clipboard",
      inputValue: permalink,
      showCloseButton: true,
    }).then((x) => {
      console.log(x);
    });
    setTimeout(() => {
      const textfield = document.getElementById("swal2-input");
      textfield.select();
    }, 500);
  };

  useEffect(() => {
    if (window.location.search.indexOf("td") > -1) {
      const url = new URL(window.location.href);
      const td = url.searchParams.get("td");
      const parsedTD = JSON.parse(td);
      context.updateOfflineTD(JSON.stringify(parsedTD, null, 2));
    }
    //because the GET Param should be only loaded once, the next line was added
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const shortcutHandler = (e) => {
      if (
        (window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) &&
        e.key === "s"
      ) {
        e.preventDefault();
        e.stopPropagation();
        saveFile();
      }
      if (
        (window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) &&
        e.key === "o"
      ) {
        e.preventDefault();
        e.stopPropagation();
        openFile();
      }
      if (
        (window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) &&
        e.key === "n"
      ) {
        e.preventDefault();
        e.stopPropagation();
        newFile();
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
  }, [openFile, saveFile, newFile, context]);

  return (
    <>
      <header className="flex justify-between items-center h-16 bg-blue-500">
        <div className="flex items-center">
          <img className="pl-2 h-12" src={wot} alt="WOT" />
          <div className="w-2"></div>
          <img className="pl-2 h-8" src={logo} alt="LOGO" />
        </div>
        <div className="flex space-x-2 pr-2">
          <Button onClick={createPermalink}>Create Permalink</Button>
          <Button onClick={newFile}>New TD/TM</Button>
          <Button onClick={openFile}>Open TD/TM</Button>
          <Button onClick={saveFile}>Save</Button>
          <Button onClick={saveFileAs}>Save As</Button>
          {context.isThingModel && <Button onClick={saveFileAsTD}>Create as TD</Button>}
        </div>
        {showModal ? (
          <div className="flex bg-gray-300 bg-opacity-50 w-full h-full absolute top-0 left-0 justify-center items-center z-10 text-white">
            <div className="bg-gray-500 w-1/3 flex flex-col justify-start rounded-xl shadow-xl p-4">
              <div className="flex flex-row justify-start items-center  ">
                <h1 className="text-xl font-bold flex-grow">Save TM as TD</h1>
              </div>
              <h2 className="text-gray-400 py-2">Please provide values to switch the placeholders with.</h2>
              {htmlPlaceholders}
              <div className="flex justify-end pt-4">
                <button className="text-white bg-gray-500 p-2 mr-1 rounded-md" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="flex text-white bg-blue-500 p-2 rounded-md" onClick={() => saveTMasTD()}>Save TD</button>
              </div>
            </div>
          </div>
        ) : null}
      </header>
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
