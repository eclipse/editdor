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
import React, { useContext, useState, useRef, useEffect } from "react";
import MonacoEditor from "react-monaco-editor";
import ediTDorContext from "../../context/ediTDorContext";
import { changeBetweenTd } from '../../util';
import {tdValidator} from "../../external/TdPlayground";

const mapping = require("../../assets/mapping.json");

const tdSchema =
  "https://raw.githubusercontent.com/thingweb/thingweb-playground/%40thing-description-playground/web%401.0.0/packages/playground-core/td-schema.json";
const tmSchema =
  "https://raw.githubusercontent.com/w3c/wot-thing-description/main/validation/tm-json-schema-validation.json";

//List of all Options can be found here: https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html
const editorOptions = {
  selectOnLineNumbers: true,
  automaticLayout: true,
  lineDecorationsWidth: 20,
};

const JSONEditorComponent = (props) => {
  const context = useContext(ediTDorContext);
  const [schemas] = useState([]);
  const [proxy, setProxy] = useState(undefined);
  const editorInstance = useRef(null);
  const [tabs, setTabs] = useState([]);

  const editorWillMount = async (monaco) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      enableSchemaRequest: true,
      schemas: [],
    });

    if (!("Proxy" in window)) {
      console.warn("Your browser doesn't support Proxies.");
      return;
    }

    let proxy = new Proxy(schemas, {
      set: function (target, property, value, _) {
        target[property] = value;

        let jsonSchemaObjects = [tdSchema];
        for (let i = 0; i < target.length; i++) {
          jsonSchemaObjects.push({
            fileMatch: ["*/*"],
            uri: target[i],
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

  const editorDidMount = (editor, monaco) => {
    editor.onDidChangeModelDecorations(() => {
      const model = editor.getModel();
      if (model === null || model.getModeId() !== "json") return;
    });
  };

  const addSchema = (val) => {
    if (proxy.includes(val)) {
      return;
    }
    proxy.push(val);
  };

  const removeSchema = (val) => {
    const index = proxy.indexOf(val);
    if (index === -1) {
      return;
    }
    proxy.splice(index, 1);
  };

  const emptySchemas = () => {
    proxy.splice(0, this.state.proxy.length);
  };

  const fetchSchema = async (target) => {
    if (proxy.includes(target)) {
      return;
    }

    try {
      const url = new URL(target);
      const res = await fetch(url);

      const schema = await res.json();
      return schema;
    } catch (e) {
      console.error(e);
    }
  };

  const onChange = async (editorText, _) => {
    try {
      const json = JSON.parse(editorText);
      if (!("@context" in json)) {
        emptySchemas();
        return;
      }
      //Initialize TD-Schema
      if (context.isThingModel === undefined) {
        context.updateIsThingModel(false);
        const schema = await fetchSchema(tdSchema);
        if (schema) {
          addSchema(tdSchema);
        }
      }

      const atContext = json["@context"];
      const atType = json["@type"];
      if (atType && atType.indexOf("ThingModel") > -1) {
        if (!context.isThingModel) {
          context.updateIsThingModel(true);
          const schema = await fetchSchema(tmSchema);
          if (schema) {
            addSchema(tmSchema);
            removeSchema(tdSchema);
          }
        }
      } else if (context.isThingModel) {
        if (
          JSON.stringify(atContext).indexOf(
            "https://www.w3.org/2019/wot/td/v1"
          ) > -1
        ) {
          context.updateIsThingModel(false);
          const schema = await fetchSchema(tdSchema);
          if (schema) {
            addSchema(tdSchema);
            removeSchema(tmSchema);
          }
        }
      }

      // handle if @context is a string
      if (typeof atContext === "string") {
        if (mapping[atContext] !== undefined && !proxy.includes(mapping[atContext])) {
          const schema = await fetchSchema(atContext);
          if (schema) {
            addSchema(atContext);
          }
          return;
        }
      }

      // handle if @context is an array
      if (Array.isArray(atContext)) {
        for (let i = 0; i < atContext.length; i++) {
          if (typeof atContext[i] === "string") {
            if (mapping[atContext] !== undefined && !proxy.includes(mapping[atContext])) {
              console.log("found schema for", atContext);
              const schema = await fetchSchema(atContext[i]);
              if (schema) {
                addSchema(atContext[i]);
              }
            }
          }
          if (typeof atContext[i] === "object") {
            Object.keys(atContext[i]).forEach(async (contextKey) => {
              if (mapping[atContext[i][contextKey]] !== undefined && !proxy.includes(mapping[atContext])) {
                const schema = await fetchSchema(mapping[atContext[i][contextKey]]);
                if (schema) {
                  addSchema(mapping[atContext[i][contextKey]]);
                }
              }
            });
          }
        }
      }
      // remove deleted schemas
      if (Array.isArray(atContext)) {
        for (let i = 0; i < proxy.length; i++) {
          const x = Object.keys(mapping).find(
            (key) => mapping[key] === proxy[i]
          );
          if (!atContext.includes(x)) {
            removeSchema(proxy[i]);
          }
        }
      }
    } catch (e) {
    } finally {
      tdValidator(editorText, console.log, {}).then(result =>{
        context.updateValidationMessage(result);
        context.updateOfflineTD(editorText, "Editor");
      }, err =>{
        console.log("Error");
        console.log(err);
      })
    }
  };

  useEffect(() => {
    async function getTabs() {
      try {
        if (context.linkedTd) {
          let tabs = [];
          let index = 0;
          for (let key in context.linkedTd) {
            if (context.linkedTd[key]["kind"] === "file" || Object.keys(context.linkedTd[key]).length) {
              tabs.push(<option value={key} key={index}>{key}</option>);
              index++;
            }
          }
          setTabs(tabs);
        }
      } catch (err) {
        console.error(err);
      }
    }
    getTabs();
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
          value={context.offlineTD}
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
