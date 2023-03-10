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
import React, { useContext, useState, useRef, useEffect, useCallback } from "react";
import MonacoEditor from "react-monaco-editor";
import ediTDorContext from "../../context/ediTDorContext";
import { changeBetweenTd } from '../../util';

//List of all Options can be found here: https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html
const editorOptions = {
  selectOnLineNumbers: true,
  automaticLayout: true,
  lineDecorationsWidth: 20,
};

// delay function that executes the callback once it hasn't been called for
// at least x ms.
const delay = (fn, ms) => {
  let timer = 0
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(fn.bind(this, ...args), ms || 0)
  }
}

const JSONEditorComponent = (props) => {
  const context = useContext(ediTDorContext);
  const [schemas] = useState([]);
  const [proxy, setProxy] = useState(undefined);
  const editorInstance = useRef(null);
  const [tabs, setTabs] = useState([]);
  const [text, setText] = useState("");
  const [localTextState, setLocalTextState] = useState("");

  const validationWorker = React.useMemo(() => new Worker(new URL('../../workers/validationWorker.js', import.meta.url)), []);
  const schemaWorker = React.useMemo(() => new Worker(new URL('../../workers/schemaWorker.js', import.meta.url)), []);

  const messageWorkers = useCallback((editorText) => {
    schemaWorker.postMessage(editorText);
    validationWorker.postMessage(editorText);
  }, [schemaWorker, validationWorker]);

  const messageWorkersAfterDelay = delay(messageWorkers, 500);

  useEffect(() => {
    const updateMonacoSchemas = (schemaMap) => {
      proxy.splice(0, proxy.length);

      schemaMap.forEach(function (schema, schemaUri) {
        console.debug(`using schema: ${schemaUri}`);
        proxy.push({ "schemaUri": schemaUri, "schema": schema });
      });
    };

    schemaWorker.onmessage = (ev) => {
      console.debug("received message from schema worker");
      updateMonacoSchemas(ev.data);
    }

    validationWorker.onmessage = (ev) => {
      console.debug("received message from validation worker");
      context.updateValidationMessage(ev.data);
    }
  }, [schemaWorker, validationWorker, proxy, context]);

  useEffect(() => {
    // check if the offline TD update was triggered by the editor. If not
    // the editor should not be rerendered.
    if (context.offlineTD !== localTextState) {
      setText(context.offlineTD);
      messageWorkers(context.offlineTD);
    }
  }, [context.offlineTD, messageWorkers, localTextState]);

  const editorWillMount = (_) => { };

  const editorDidMount = (_, monaco) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      enableSchemaRequest: true,
      schemas: [],
    });

    if (!("Proxy" in window)) {
      console.warn("dynamic fetching of schemas is disabled as your browser doesn't support proxies.");
      return;
    }

    let proxy = new Proxy(schemas, {
      set: function (target, property, value, _) {
        target[property] = value;

        let jsonSchemaObjects = [];
        for (let i = 0; i < target.length; i++) {
          jsonSchemaObjects.push({
            fileMatch: ["*/*"],
            uri: target[i].schemaUri,
            schema: target[i].schema,
          });
        }

        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
          validate: true,
          enableSchemaRequest: true,
          schemas: jsonSchemaObjects,
        });

        return true;
      },
    });

    setProxy(proxy);
  };

  const onChange = async (editorText, _) => {
    context.updateOfflineTD(editorText);
    setLocalTextState(editorText)
    messageWorkersAfterDelay(editorText);
  };

  useEffect(() => {
    if (!context.linkedTd) {
      return;
    }

    try {
      let tabs = [];
      let index = 0;
      for (let key in context.linkedTd) {
        if (context.linkedTd[key]["kind"] === "file" || Object.keys(context.linkedTd[key]).length) {
          tabs.push(<option value={key} key={index}>{key}</option>);
          index++;
        }
      }
      setTabs(tabs);
    } catch (err) {
      console.debug(err);
    }

  }, [context.linkedTd, context.offlineTD]);

  const changeLinkedTd = async () => {
    let href = document.getElementById("linkedTd").value;
    changeBetweenTd(context, href);
  }

  return (
    <>
      <div id="tabsBackground" >
        {
          context.offlineTD && context.linkedTd &&
          <select name="linkedTd" id="linkedTd" className="text-white" onChange={() => changeLinkedTd()}>
            {tabs}
          </select>
        }
      </div>
      <div className="w-full h-full" id="editor">
        <MonacoEditor
          options={editorOptions}
          theme={"vs-" + context.theme}
          language="json"
          ref={editorInstance}
          value={text}
          editorWillMount={editorWillMount}
          editorDidMount={editorDidMount}
          onChange={async (editorText) => {
            await onChange(editorText);
          }}
        />
      </div>
    </>

  );
};

export default JSONEditorComponent;
