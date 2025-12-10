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
import React, { forwardRef, useContext, useImperativeHandle } from "react";
import ReactDOM from "react-dom";
import ediTDorContext from "../../context/ediTDorContext";
import { checkIfFormIsInItem } from "../../util";
import DialogTemplate from "./DialogTemplate";
import AddForm from "../App/AddForm";
import FormCheckbox from "./FormCheckbox";

export type OperationsType = "property" | "action" | "event" | "thing" | "";
export type OperationsMap = PropertyMap | ActionMap | EventMap | ThingMap;

type PropertyMap =
  | ["writeproperty", "readproperty", "observeproperty", "unobserveproperty"]
  | [];
type ActionMap = ["invokeaction"] | [];
type EventMap = ["subscribeevent", "unsubscribeevent"] | [];
type ThingMap =
  | [
      "writeallproperties",
      "readallproperties",
      "writemultipleproperties",
      "readmultipleproperties",
      "observeallproperties",
      "unobserveallproperties",
    ]
  | [];

export interface AddFormDialogRef {
  openModal: () => void;
  close: () => void;
}

interface Form {
  op: string[];
  href: string;
}

interface AddFormDialogProps {
  type?: OperationsType;
  interaction?: { forms?: Form[] };
  interactionName?: string;
}

const AddFormDialog = forwardRef<AddFormDialogRef, AddFormDialogProps>(
  (props, ref) => {
    const context = useContext(ediTDorContext);
    const [display, setDisplay] = React.useState<boolean>(() => {
      return false;
    });

    const type: OperationsType = props.type || "";
    const name = type && type[0].toUpperCase() + type.slice(1);
    const interaction = props.interaction ?? {};
    const interactionName = props.interactionName ?? "";

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

    const checkIfFormExists = (form: Form): boolean | undefined => {
      if (interaction.forms) {
        return checkIfFormIsInItem(form, interaction);
      }
      return false;
    };

    const typeToJSONKey = (type: string): string => {
      const typeToJSONKey: Record<string, string> = {
        action: "actions",
        property: "properties",
        event: "events",
        thing: "thing",
      };

      return typeToJSONKey[type];
    };

    const formSelection = operationsSelections(type);

    const onHandleEventRightButton = () => {
      const form: Form = {
        op: operations(type)
          .map((x) => {
            const element = document.getElementById(
              "form-" + x
            ) as HTMLInputElement;
            return element?.checked ? element.value : undefined;
          })
          .filter((y): y is string => y !== undefined),
        href:
          (
            document.getElementById("form-href") as HTMLInputElement
          )?.value?.trim() || "/",
      };

      if (form.op.length === 0) {
        showErrorMessage("You have to select at least one operation ...");
      } else if (checkIfFormExists(form)) {
        showErrorMessage(
          "A Form for one of the selected operations already exists ..."
        );
      } else {
        context.addForm(typeToJSONKey(type), interactionName, form);
        close();
      }
    };

    if (display) {
      return ReactDOM.createPortal(
        <DialogTemplate
          onHandleEventLeftButton={close}
          onHandleEventRightButton={onHandleEventRightButton}
          rightButton={"Add Form"}
          leftButton="Cancel"
          hasSubmit={true}
          title={`Add ${name} Form`}
          description={`Tell us how this ${name} can be interfaced by selecting operations below and providing an href.`}
        >
          <AddForm
            type={type as OperationsType}
            onHrefInputChange={clearErrorMessage}
            operations={operations}
            defaultValue={interaction.forms?.[0].href ?? ""}
          ></AddForm>
        </DialogTemplate>,
        document.getElementById("modal-root") as HTMLElement
      );
    }
    return null;
  }
);

const showErrorMessage = (msg) => {
  (document.getElementById("form-href-info") as HTMLElement).textContent = msg;
  (document.getElementById("form-href") as HTMLInputElement).classList.remove(
    "border-gray-600"
  );
  (document.getElementById("form-href") as HTMLInputElement).classList.add(
    "border-red-400"
  );
};

const clearErrorMessage = () => {
  (document.getElementById("form-href") as HTMLElement).classList.add(
    "border-gray-600"
  );
  (document.getElementById("form-href") as HTMLInputElement).classList.remove(
    "border-red-400"
  );
};

const operations = (type: OperationsType): OperationsMap => {
  switch (type) {
    case "property":
      return [
        "writeproperty",
        "readproperty",
        "observeproperty",
        "unobserveproperty",
      ];
    case "event":
      return ["subscribeevent", "unsubscribeevent"];
    case "action":
      return ["invokeaction"];
    case "thing":
      return [
        "writeallproperties",
        "readallproperties",
        "writemultipleproperties",
        "readmultipleproperties",
        "observeallproperties",
        "unobserveallproperties",
      ];
    default:
      return [];
  }
};

const operationsSelections = (type: OperationsType): JSX.Element => {
  return (
    <div className="rounded-md bg-gray-600 p-1">
      {operations(type).map((e) => (
        <FormCheckbox key={`form-${e}`} name={e} />
      ))}
    </div>
  );
};

export default AddFormDialog;
AddFormDialog.displayName = "AddFormDialog";
