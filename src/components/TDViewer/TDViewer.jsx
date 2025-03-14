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
import React, { useContext, useEffect, useState } from "react";
import ediTDorContext from "../../context/ediTDorContext";
import {
  buildAttributeListObject,
  getDirectedValue,
  separateForms,
} from "../../util";
import { AddFormDialog } from "../Dialogs/AddFormDialog";
import { InfoIconWrapper } from "../InfoIcon/InfoIcon";
import { getFormsTooltipContent } from "../InfoIcon/InfoTooltips";
import Form from "./components/Form";
import { InteractionSection } from "./components/InteractionSection";
import { RenderedObject } from "./components/RenderedObject";
import ValidationView from "./components/ValidationSection";
import LinkView from "./components/LinkSection";

export default function TDViewer() {
  const context = useContext(ediTDorContext);

  const [td, setTd] = useState(undefined);
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

  const addFormDialog = React.useRef();
  const openAddFormDialog = () => {
    addFormDialog.current.openModal();
  };

  useEffect(() => {
    try {
      setTd(JSON.parse(context.offlineTD));
    } catch (e) {
      console.debug(e);
    }
  }, [context.offlineTD]);

  if (!td || !Object.keys(td).length) {
    return (
      <div className="flex h-full w-full bg-gray-500 justify-center align-center text-center ">
        <div className="text-4xl text-white place-self-center">
          Start writing a new TD or TM by clicking "New"
        </div>
      </div>
    );
  }

  let forms;
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
    <div className="h-full w-full bg-gray-500 p-8 overflow-auto">
      <ValidationView />
      {td !== undefined && Object.keys(td).length > 0 && (
        <div>
          <div className="text-3xl text-white">
            {td.title ? getDirectedValue(td, "title", td["@context"]) : <></>}
          </div>
          {td.description ? (
            <div className="text-xl text-white pt-4">
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
        <summary className="flex justify-start items-center cursor-pointer">
          <div className="flex flex-grow">
            <InfoIconWrapper tooltip={getFormsTooltipContent()}>
              <h2 className="text-2xl text-white p-1 flex-grow">Forms</h2>
            </InfoIconWrapper>
          </div>
          <button
            className="text-white font-bold text-sm bg-blue-500 cursor-pointer rounded-md p-2"
            onClick={openAddFormDialog}
          >
            Add Top Level Form
          </button>
          <AddFormDialog type="thing" interaction={td} ref={addFormDialog} />
        </summary>
        {forms && (
          <div className="pt-4">
            <div className="rounded-lg bg-gray-600 px-6 pt-4 pb-4">{forms}</div>
          </div>
        )}
      </details>

      <LinkView />

      <InteractionSection interaction="Properties"></InteractionSection>
      <InteractionSection interaction="Actions"></InteractionSection>
      <InteractionSection interaction="Events"></InteractionSection>
    </div>
  );
}
