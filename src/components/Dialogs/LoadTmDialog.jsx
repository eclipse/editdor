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
import { ChevronDown, Search } from "react-feather";

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

  useImperativeHandle(ref, () => {
    return {
      openModal: () => open(),
      close: () => close(),
    };
  });

  const open = async () => {
    setThingModels(await fetchThingModels());
    setDisplay(true);
  };

  const close = () => {
    setDisplay(false);
  };
  const setSelectedThingModel = (index) => {
    setThingModels(
      thingModels.map((thing, thingIndex) => {
        if (thingIndex === index) thing.selected = true;
        else thing.selected = false;
        return thing;
      })
    );
  };

  const fetchThingModels = async () => {
    const res = await fetch(`${emporioUrl}/models`);
    const data = await res.json();
    return data;
  };

  const searchThingModels = async () => {
    const attribute =
      document.getElementById("search-option").value;
    const searchText =
      document.getElementById("search-id").value;
    if (searchText === "") {
      return setThingModels(await fetchThingModels());
    }
    console.log(attribute);
    console.log(searchText);
    const res = await fetch(
      `${emporioUrl}/models?${attribute}=${searchText}`
    );
    setThingModels(await res.json());
  };

  const content = buildForm(
    thingModels,
    setChoosenModel,
    setSelectedThingModel,
    searchThingModels
  );

  if (display) {
    return ReactDOM.createPortal(
      <DialogTemplate
        onCancel={close}
        onSubmit={() => {
          let thingModel = choosenModel;
          let linkedModel = {};
          linkedModel[thingModel["title"]] = thingModel;
          context.updateLinkedTd(undefined);
          context.addLinkedTd(linkedModel);
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

const buildForm = (
  thingModels,
  setChoosenModel,
  setSelectedThingModel,
  searchThingModels
) => {
  return (
    <>
      <div className="flex">
        <div className="relative w-1/4">
          <select
            className="block appearance-none w-full bg-gray-600 border-2 border-gray-600 text-white py-3 px-4 pr-8 rounded leading-tight focus:border-blue-500 focus:outline-none"
            id="search-option"
          >
            <option selected>title</option>
            <option>description</option>
            <option>type</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <ChevronDown color="#cacaca"></ChevronDown>
          </div>
        </div>
        <input
          name="search-id"
          id="search-id"
          className="w-7/10 border-gray-600 bg-gray-600 p-2 sm:text-sm border-2 text-white rounded-md focus:outline-none focus:border-blue-500"
          placeholder="Search Thing Models"
          type="search"
        />

        <button
          type="submit"
          class="text-white bg-blue-500 p-2 rounded-md"
          onClick={() => {
            searchThingModels();
          }}
        >
          Search
        </button>
      </div>
      {thingModels.map((thingModel, index) => (
        <ThingModel
          key={index}
          index={index}
          thingModel={thingModel}
          setChoosenModel={setChoosenModel}
          setSelectedThingModel={setSelectedThingModel}
        />
      ))}
    </>
  );
};

const ThingModel = ({
  thingModel,
  index,
  setChoosenModel,
  setSelectedThingModel,
}) => {
  const types = formatThingModeltypes(thingModel["@type"]);
  return (
    <div
      className={`thingModel 
        my-1
        p-1
        bg-gray-600 
        border-2 
        rounded w-full 
        text-white
        ${
          thingModel.selected
            ? "border-blue-500"
            : "border-gray-600"
        }`}
      onClick={() => {
        setSelectedThingModel(index);
        setChoosenModel(thingModel);
      }}
    >
      <div className="relative">
        <h3 className="px-2">{thingModel.title}</h3>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
          {types ? types.map((type) => <p>{type}</p>) : ""}
        </div>
      </div>
      <p className="text-gray-300 py-1 pl-1 my-1">
        {thingModel.description}
      </p>
    </div>
  );
};

const formField = (placeholder, id, type, autoFocus) => {
  return (
    <div key={id} className="py-1">
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

const formatThingModeltypes = (type) => {
  if (Array.isArray(type)) {
    return type.filter(
      (element) => element !== "tm:ThingModel"
    );
  }
};
