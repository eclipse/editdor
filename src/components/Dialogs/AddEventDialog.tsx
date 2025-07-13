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
import React, { forwardRef, useContext, useImperativeHandle } from "react";
import ReactDOM from "react-dom";
import ediTDorContext from "../../context/ediTDorContext";
import DialogTextArea from "./base/DialogTextArea";
import DialogTextField from "./base/DialogTextField";
import DialogTemplate from "./DialogTemplate";

export interface AddEventDialogRef {
  openModal: () => void;
  close?: () => void;
}

interface Event {
  title: string;
  description?: string;
  forms: any[];
}

const AddEventDialog = forwardRef<AddEventDialogRef>((_, ref) => {
  const context = useContext(ediTDorContext);
  const [display, setDisplay] = React.useState<boolean>(() => {
    return false;
  });

  const type = "event";
  const key = "events";
  const name = type && type[0].toUpperCase() + type.slice(1);

  useImperativeHandle(ref, () => {
    return {
      openModal: () => open(),
      close: () => close(),
    };
  });

  const open = () => {
    setDisplay(true);
  };

  const close = () => {
    setDisplay(false);
  };

  const children = (
    <>
      <DialogTextField
        id={`${type}-title`}
        label="Title"
        placeholder={`${name} Title`}
        autoFocus={true}
        onChange={() => clearErrorMessage()}
      />
      <DialogTextArea
        id={`${type}-description`}
        label="Description"
        placeholder={`A short description about the new ${name}...`}
      />
    </>
  );

  const onAddEvent = () => {
    const event: Event = {
      title: (document.getElementById(`${type}-title`) as HTMLInputElement)
        .value,
      forms: [],
    };

    const description = (
      document.getElementById(`${type}-description`) as HTMLTextAreaElement
    ).value;
    if (description !== "") {
      event.description = description;
    }
    event.forms = [];

    if (!context.isValidJSON) {
      showErrorMessage(`Can't add Event. TD is malformed.`);
      return;
    }

    const td = context.parsedTD;
    if (td[key] && td[key][event.title]) {
      showErrorMessage(`An ${name} with this title already exists...`);
    } else {
      td[key] = { ...td[key], [event.title]: event };
      context.updateOfflineTD(JSON.stringify(td, null, 2));
      close();
    }
  };

  const showErrorMessage = (msg: string) => {
    (
      document.getElementById(`${type}-title-helper-text`) as HTMLElement
    ).textContent = msg;
    (
      document.getElementById(`${type}-title`) as HTMLInputElement
    ).classList.remove("border-gray-600");
    (
      document.getElementById(`${type}-title`) as HTMLInputElement
    ).classList.add("border-red-400");
  };

  const clearErrorMessage = () => {
    (
      document.getElementById(`${type}-title-helper-text`) as HTMLInputElement
    ).textContent = "";
    (
      document.getElementById(`${type}-title`) as HTMLInputElement
    ).classList.add("border-gray-600");
    (
      document.getElementById(`${type}-title`) as HTMLInputElement
    ).classList.remove("border-red-400");
  };

  if (display) {
    return ReactDOM.createPortal(
      <DialogTemplate
        onCancel={close}
        onSubmit={() => {
          onAddEvent();
        }}
        submitText={`Add ${name}`}
        children={children}
        title={`Add New ${name}`}
        description={`Tell us a little something about the ${name} you want to add.`}
      />,
      document.getElementById("modal-root") as HTMLElement
    );
  }

  return null;
});

export default AddEventDialog;
AddEventDialog.displayName = "AddEventDialog";
