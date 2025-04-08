/********************************************************************************
 * Copyright (c) 2018 - 2022 Contributors to the Eclipse Foundation
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
import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
} from "react";
import ReactDOM from "react-dom";
import ediTDorContext from "../../context/ediTDorContext";
import { checkIfFormIsInItem } from "../../util.js";
import { DialogTemplate } from "./DialogTemplate";

export const AddFormDialog = forwardRef((props, ref) => {
  const context = useContext(ediTDorContext);
  const [display, setDisplay] = React.useState(() => {
    return false;
  });

  const type = props.type ?? "";
  const name = type && type[0].toUpperCase() + type.slice(1);
  const interaction = props.interaction ?? {};
  const interactionName = props.interactionName ?? "";

  useEffect(() => {}, [display, context]);

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

  const checkIfFormExists = (form) => {
    if (interaction.forms) {
      return checkIfFormIsInItem(form, interaction);
    }
    return false;
  };

  const typeToJSONKey = (type) => {
    const typeToJSONKey = {
      action: "actions",
      property: "properties",
      event: "events",
      thing: "thing",
    };

    return typeToJSONKey[type];
  };

  const formSelection = operationsSelections(type);
  const children = (
    <>
      <label className="pl-3 text-sm font-medium text-gray-400">
        Operations:
      </label>
      <div className="p-1">{formSelection}</div>
      <div className="p-1 pt-2">
        <label
          htmlFor="form-href"
          className="pl-2 text-sm font-medium text-gray-400"
        >
          Href:
        </label>
        <input
          type="text"
          name="form-href"
          id="form-href"
          className="w-full rounded-md border-2 border-gray-600 bg-gray-600 p-2 text-white focus:border-blue-500 focus:outline-none sm:text-sm"
          placeholder="http://example.com/href"
          onChange={() => {
            clearErrorMessage();
          }}
        />
        <span id="form-href-info" className="pl-2 text-xs text-red-400"></span>
      </div>
    </>
  );

  if (display) {
    return ReactDOM.createPortal(
      <DialogTemplate
        onCancel={close}
        onSubmit={() => {
          let form = {};
          form.op = operations(type)
            .map((x) => {
              return document.getElementById("form-" + x).checked
                ? document.getElementById("form-" + x).value
                : undefined;
            })
            .filter((y) => y !== undefined);

          const href = document.getElementById("form-href").value;
          form.href = href !== "" ? href.trim() : "/";

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
        }}
        submitText={"Add"}
        children={children}
        title={`Add ${name} Form`}
        description={`Tell us how this ${name} can be interfaced by selecting operations below and providing an href.`}
      />,
      document.getElementById("modal-root")
    );
  }

  return null;
});

const showErrorMessage = (msg) => {
  document.getElementById("form-href-info").textContent = msg;
  document.getElementById("form-href").classList.remove("border-gray-600");
  document.getElementById("form-href").classList.add("border-red-400");
};

const clearErrorMessage = () => {
  document.getElementById("form-href").classList.add("border-gray-600");
  document.getElementById("form-href").classList.remove("border-red-400");
};

const operations = (type) => {
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

const operationsSelections = (type) => {
  return (
    <div className="rounded-md bg-gray-600 p-1">
      {operations(type).map((e) => formCheckbox(e))}
    </div>
  );
};

const formCheckbox = (name) => {
  const id = `form-${name}`;

  return (
    <div key={id} className="form-checkbox pl-2">
      {name !== "invokeaction" ? (
        <input
          id={id}
          className="form-checkbox-input"
          type="checkbox"
          value={name}
        />
      ) : (
        <input
          id={id}
          className="form-checkbox-input"
          type="checkbox"
          value={name}
          readOnly={name === "invokeaction"}
          checked={name === "invokeaction"}
        />
      )}
      <label className="form-checkbox-label pl-2" htmlFor={id}>
        {name}
      </label>
    </div>
  );
};
