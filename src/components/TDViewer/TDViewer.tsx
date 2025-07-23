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

import React, { useContext, useCallback } from "react";
import ediTDorContext from "../../context/ediTDorContext";
import {
  buildAttributeListObject,
  getDirectedValue,
  separateForms,
} from "../../util";
import AddFormDialog from "../Dialogs/AddFormDialog";
import InfoIconWrapper from "../InfoIcon/InfoIconWrapper";
import { getFormsTooltipContent } from "../InfoIcon/TooltipMapper";
import Form from "./components/Form";
import InteractionSection from "./components/InteractionSection";
import RenderedObject from "./components/RenderedObject";
import ValidationView from "./components/ValidationView";
import LinkSection from "./components/LinkSection";
import { useDropzone } from "react-dropzone";
import BaseButton from "./base/BaseButton";

import type { ThingDescription } from "wot-thing-description-types";
interface ITDViewerProps {
  onUndo: () => void;
  onRedo: () => void;
}

interface IAddFormDialogRef {
  openModal: () => void;
}

const TDViewer: React.FC<ITDViewerProps> = ({ onUndo, onRedo }) => {
  const context = useContext(ediTDorContext);
  const td: ThingDescription = context.parsedTD;
  const alreadyRenderedKeys = [
    "id",
    "properties",
    "actions",
    "events",
    "forms",
    "description",
    "title",
    "links",
  ];

  const addFormDialog = React.useRef<IAddFormDialogRef>();
  const handleOpenAddFormDialog = () => {
    addFormDialog.current?.openModal();
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onabort = (): void => console.error("File reading  - aborted");
      reader.onerror = (): void => console.error("File reading - failed");
      reader.onload = (): void => {
        const fileData = {
          td: reader.result,
          fileName: file.name,
          fileHandle: file,
        };
        try {
          let linkedTd: Record<string, File> = {};
          linkedTd[fileData.fileName] = fileData.fileHandle;
          context.updateOfflineTD(fileData.td);
          context.updateIsModified(false);
          context.setFileHandle(fileData.fileName);
          context.updateLinkedTd(undefined);
          context.addLinkedTd(linkedTd);
        } catch (e) {
          console.error("File processing:", e);
        }
      };
      reader.readAsText(file);
    },
    [context]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/json": [".json"],
      "application/ld+json": [".jsonld"],
    },
    noClick: true,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  if (!context.offlineTD) {
    return (
      <div
        {...getRootProps()}
        className="align-center flex h-full w-full justify-center justify-items-center bg-gray-500 text-center"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <div className="place-self-center text-4xl text-white">
            <p>Drop the files here ...</p>
          </div>
        ) : (
          <div className="place-self-center text-4xl text-white">
            Start writing a new TD by clicking &quot;Create&quot;
            <p>or drag and drop .json file here</p>
            <div className="pt-4">
              <p className="text-xl text-gray-600">
                For linux operating systems, it is necessary to give the
                necessary file permissions. Run sudo xdg-open
                /path/to/the/folder
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  let forms: JSX.Element[] | undefined;
  if (td.forms) {
    const formsSeparated = separateForms(td.forms);
    forms = formsSeparated.map((key, index) => {
      return <Form form={key} propName={index} key={index} />;
    });
  }

  const attributeListObject = buildAttributeListObject(
    td.id ? { id: td.id } : {},
    td,
    alreadyRenderedKeys
  );

  return (
    <div className="h-full w-full overflow-auto bg-gray-500 p-6">
      <ValidationView onUndo={onUndo} onRedo={onRedo} />
      {td !== undefined && Object.keys(td).length > 0 && (
        <div>
          <div className="text-3xl text-white">
            {td.title ? getDirectedValue(td, "title", td["@context"]) : <></>}
          </div>
          {td.description ? (
            <div className="pt-4 text-xl text-white">
              {getDirectedValue(td, "description", td["@context"])}
            </div>
          ) : (
            <></>
          )}
          <div className="pt-4">
            <RenderedObject {...attributeListObject}></RenderedObject>
          </div>
        </div>
      )}

      <details className="pt-8">
        <summary className="flex cursor-pointer items-center justify-start">
          <div className="flex flex-grow">
            <InfoIconWrapper tooltip={getFormsTooltipContent()} id="forms">
              <h2 className="flex-grow p-1 text-2xl text-white">Forms</h2>
            </InfoIconWrapper>
          </div>
          <BaseButton
            onClick={handleOpenAddFormDialog}
            variant="primary"
            type="button"
          >
            Add Top Level Form
          </BaseButton>
          <AddFormDialog type="thing" interaction={td} ref={addFormDialog} />
        </summary>
        {forms && (
          <div className="pt-4">
            <div className="rounded-lg bg-gray-600 px-6 pb-4 pt-4">{forms}</div>
          </div>
        )}
      </details>

      <LinkSection />

      <InteractionSection interaction="Properties"></InteractionSection>
      <InteractionSection interaction="Actions"></InteractionSection>
      <InteractionSection interaction="Events"></InteractionSection>

      <div className="h-10"></div>
    </div>
  );
};

export default TDViewer;
