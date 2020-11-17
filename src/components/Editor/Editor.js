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
import React, { useContext } from 'react';
import MonacoEditor from 'react-monaco-editor';
import ediTDorContext from '../../context/ediTDorContext';

const tdSchema = {
  fileMatch: ["*/*"],
  uri: "https://raw.githubusercontent.com/thingweb/thingweb-playground/%40thing-description-playground/web%401.0.0/packages/playground-core/td-schema.json"
};

//List of all Options can be found here: https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html
const editorOptions = {
  selectOnLineNumbers: true,
  automaticLayout: true,
  lineDecorationsWidth: 20
};

const JSONEditorComponent = () => {
  const context = useContext(ediTDorContext);

  const editorWillMount = (monaco) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      enableSchemaRequest: true,
      schemas: [tdSchema]
    });
  }

  const editorDidMount = (editor, monaco) => {
    editor.onDidChangeModelDecorations(() => {
      const model = editor.getModel();

      if (model === null || model.getModeId() !== "json")
        return;
    });
  }

  const onChange = async (editorText, _) => {
    context.updateOfflineTD(editorText)
  }

  return (
    <div className="w-full h-full">
      <MonacoEditor
        options={editorOptions}
        theme={'vs-' + context.theme}
        language="json"
        value={context.offlineTD}
        editorWillMount={editorWillMount}
        editorDidMount={editorDidMount}
        onChange={async (editorText) => { await onChange(editorText) }} />
    </div>
  );
}

export default JSONEditorComponent