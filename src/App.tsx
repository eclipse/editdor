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
import React, { useContext, useEffect, useState, useRef } from "react";
import ediTDorContext from "./context/ediTDorContext";
import GlobalState from "./context/GlobalState";
import JsonEditor from "./components/Editor/JsonEditor";
import TDViewer from "./components/TDViewer/TDViewer";
import "./App.css";
import AppFooter from "./components/App/AppFooter";
import AppHeader from "./components/App/AppHeader";
import { Container, Section, Bar } from "@column-resizer/react";
import { RefreshCw } from "react-feather";
import { retrieveThing } from "./services/thingsApiService";
import { decompressSharedTd } from "./share";
import { editor } from "monaco-editor";

const GlobalStateWrapper = () => {
  return (
    <GlobalState>
      <App />
    </GlobalState>
  );
};

// The useEffect hook for checking the URI was called twice somehow.
// This variable prevents the callback from being executed twice.
let checkedUrl = false;

const App: React.FC = () => {
  const context = useContext(ediTDorContext);

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [doShowJSON, setDoShowJSON] = useState(false);

  const handleOnClickUndo = () => {
    if (editorRef.current) {
      editorRef.current.trigger("keyboard", "undo", null);
    }
  };

  const handleOnClickRedo = () => {
    if (editorRef.current) {
      editorRef.current.trigger("keyboard", "redo", null);
    }
  };

  useEffect(() => {
    if (
      checkedUrl ||
      (window.location.search.indexOf("td") <= -1 &&
        window.location.search.indexOf("proxyEndpoint") <= -1 &&
        window.location.search.indexOf("localstorage") <= -1 &&
        window.location.search.indexOf("southboundTdId") <= -1)
    ) {
      return;
    }
    checkedUrl = true;

    const url = new URL(window.location.href);
    const compressedTd = url.searchParams.get("td");
    if (compressedTd !== null) {
      const td = decompressSharedTd(compressedTd);
      if (td === undefined) {
        alert(
          "The lz compressed TD found in the URL couldn't be reconstructed."
        );
        return;
      }

      context.updateOfflineTD(JSON.stringify(td, null, 2));
    }

    const proxyEndpointUrl = url.searchParams.get("proxyEndpoint");
    const southboundTdId = url.searchParams.get("southboundTdId");
    if (southboundTdId !== null) {
      retrieveThing(southboundTdId, proxyEndpointUrl)
        .then((td) => {
          if (!td === undefined) {
            alert(
              `No Thing Description with id '${southboundTdId} could be fetched from the proxy.`
            );
            return;
          }

          context.updateOfflineTD(JSON.stringify(td, null, 2));
        })
        .catch(() => {
          alert(`Error unable to fetch TD from proxy: ${proxyEndpointUrl}`);
        });
    }

    if (url.searchParams.has("localstorage")) {
      let td = localStorage.getItem("td");
      if (!td) {
        alert("Request to read TD from local storage failed.");
        return;
      }

      try {
        td = JSON.parse(td);
        context.updateOfflineTD(JSON.stringify(td, null, 2));
      } catch (e) {
        context.updateOfflineTD(td);
        alert(
          `Tried to JSON parse the TD from local storage, but failed: ${e}`
        );
      }
    }
  }, [context]);

  return (
    <main className="flex max-h-screen w-screen flex-col">
      <AppHeader></AppHeader>

      <div className="">
        <Container className="height-adjust flex flex-col md:flex-row">
          <Section minSize={550} className="w-full min-w-16 md:w-7/12">
            <TDViewer onUndo={handleOnClickUndo} onRedo={handleOnClickRedo} />
          </Section>

          <Bar
            size={7.5}
            className="cursor-col-resize bg-gray-300 hover:bg-blue-500"
          />

          <Section className="w-full md:w-5/12">
            <JsonEditor editorRef={editorRef} />
          </Section>
          <button
            className="fixed bottom-12 right-2 z-10 rounded-full bg-blue-500 p-4"
            onClick={() => setDoShowJSON(!doShowJSON)}
          >
            <RefreshCw color="white" />
          </button>
        </Container>
      </div>
      <div className="fixed bottom-0 w-screen">
        <AppFooter></AppFooter>
      </div>
      <div id="modal-root"></div>
    </main>
  );
};

export default GlobalStateWrapper;
