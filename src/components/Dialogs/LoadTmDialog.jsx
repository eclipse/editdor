/********************************************************************************
 * Copyright (c) 2018 - 2021 Contributors to the Eclipse Foundation
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
  useEffect,
  useImperativeHandle,
  useContext,
} from "react";
import ReactDOM from "react-dom";
import { DialogTemplate } from "./DialogTemplate";
import ediTDorContext from "../../context/ediTDorContext";
import { ChevronDown } from "react-feather";
//TODO move to .env
const emporioUrl = `http://localhost:3003`;

export const LoadTmDialog = forwardRef((props, ref) => {
  const context = useContext(ediTDorContext);
  const [display, setDisplay] = React.useState(() => {
    return false;
  });
  const [thingModels, setThingModels] = React.useState([]);
  const [choosenModel, setChoosenModel] = React.useState(
    []
  );

  useEffect(() => {
    const getThingModels = async () => {
      const tmsFromServer = await fetchThingModels();
      setThingModels(tmsFromServer);
    };
    getThingModels();
  }, []);

  const fetchThingModels = async () => {
    const res = await fetch(`${emporioUrl}/models`);
    const data = await res.json();
    return data;
  };

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

  const content = buildForm(thingModels, setChoosenModel);

  if (display) {
    return ReactDOM.createPortal(
      <DialogTemplate
        onCancel={close}
        onSubmit={() => {
          let thingModel = choosenModel;
          let linkedTd = {};
          linkedTd[thingModel["title"]] = thingModel;
          context.updateLinkedTd(undefined);
          context.addLinkedTd(linkedTd);
          context.updateShowConvertBtn(true);
          context.updateOfflineTD(
            JSON.stringify(thingModel, null, "\t"),
            "AppHeader"
          );
          close();
        }}
        children={content}
        submitText={"Load TM"}
        title={"Load new TM"}
        description={
          "Choose a template Thing Model to load"
        }
      />,
      document.getElementById("modal-root")
    );
  }

  return null;
});

const buildForm = (thingModels, setChoosenModel) => {
  return (
    <>
      <div className="relative"></div>
      {thingModels.map((thingModel, index) => (
        <ThingModel key={index} thingModel={thingModel} setChoosenModel={setChoosenModel}/>
      ))}
    </>
  );
};

const ThingModel = ({ thingModel, setChoosenModel }) => {
  return (
    <div
      className="thingModel"
      onDoubleClick={() => {
        console.log(`choosen model is ${thingModel.title}`);
        setChoosenModel(thingModel);
      }}
    >
      <h3>
        {thingModel.title} {thingModel["@type"]}
      </h3>
      <p>{thingModel.description}</p>
    </div>
  );
};

const formField = (
  label,
  placeholder,
  id,
  type,
  autoFocus
) => {
  return (
    <div key={id} className="py-1">
      <label
        htmlFor={id}
        className="text-sm text-gray-400 font-medium pl-2"
      >
        {label}:
      </label>
      <input
        name={id}
        id={id}
        className="border-gray-600 bg-gray-600 w-full p-2 sm:text-sm border-2 text-white rounded-md focus:outline-none focus:border-blue-500"
        placeholder={placeholder}
        type={type}
        autoFocus={autoFocus === "autoFocus"}
      />
    </div>
  );
};
