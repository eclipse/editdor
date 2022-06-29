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
  useImperativeHandle,
  useContext,
} from "react";
import ReactDOM from "react-dom";
import { DialogTemplate } from "./DialogTemplate";
import ediTDorContext from "../../context/ediTDorContext";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from "react-feather";

export const LoadTmDialog = forwardRef((props, ref) => {
  const context = useContext(ediTDorContext);
  const [display, setDisplay] = React.useState(() => {
    return false;
  });
  const [thingModelObjects, setThingModelObjects] =
    React.useState([]);
  const [choosenModel, setChoosenModel] = React.useState(
    []
  );

  const [showUrlForm, setShowUrlForm] =
    React.useState(false);

  const show = () => {
    setShowUrlForm(!showUrlForm);
  };
  const [emporioUrl, setEmporioUrl] = React.useState(
    `${process.env.REACT_APP_TM_SERVER_SCHEME}://${process.env.REACT_APP_TM_SERVER_HOST}:${process.env.REACT_APP_TM_SERVER_PORT}`
  );

  const [pagination, setPagination] = React.useState({
    currentPage: 0,
    loading: null,
    thingModelsPerPage: 5,
  });

  useImperativeHandle(ref, () => {
    return {
      openModal: () => open(),
      close: () => close(),
    };
  });

  const open = async () => {
    const thingModels = await fetchThingModels();
    const thingModelObjects =
      thingModelToThingModelObjects(thingModels);
    setThingModelObjects(thingModelObjects);
    setPagination({ ...pagination, loading: false });
    setDisplay(true);
  };

  const close = () => {
    setDisplay(false);
  };
  const setSelectedThingModel = (index) => {
    setThingModelObjects(
      thingModelObjects.map((thingObject, thingIndex) => {
        if (thingIndex === index)
          thingObject.selected = true;
        else thingObject.selected = false;
        return thingObject;
      })
    );
  };

  const fetchThingModels = async ({
    page = 0,
    attribute = false,
    searchText,
    remoteUrl = emporioUrl,
  } = {}) => {
    console.log(page);
    console.log(remoteUrl);
    const offset = pagination.thingModelsPerPage * page;
    let url = `${remoteUrl}/models?limit=${pagination.thingModelsPerPage}&offset=${offset}`;
    if (attribute) url += `&${attribute}=${searchText}`;
    const res = await fetch(url);
    const data = await res.json();
    return data;
  };

  const thingModelToThingModelObjects = (thingModels) =>
    thingModels.map((thingModel) => {
      return { thingModel: thingModel, select: false };
    });
  const paginate = async (direction) => {
    const page =
      direction === "right"
        ? pagination.currentPage + 1
        : pagination.currentPage - 1;
    const searchText =
      document.getElementById("search-id").value;
    const attribute =
      document.getElementById("search-option").value;
    if (page < 0) return;
    const thingModels =
      searchText === ""
        ? await fetchThingModels({ page: page })
        : await fetchThingModels({
            page: page,
            attribute: attribute,
            searchText: searchText,
          });
    if (thingModels.length <= 0) return;
    const thingModelObjects =
      thingModelToThingModelObjects(thingModels);
    setThingModelObjects(thingModelObjects);
    setPagination({ ...pagination, currentPage: page });
  };

  const changeThingModelUrl = async () => {
    const url = document.getElementById("remote-url").value;
    try {
      const thingModels = await fetchThingModels({
        remoteUrl: url,
      });
      setEmporioUrl(url);

      return setThingModelObjects(
        thingModelToThingModelObjects(thingModels)
      );
    } catch (error) {
      const msg = `Error processing URL - Thing Model Repository was not found`;
      alert(msg);
    }
    //validate URL
  };
  const searchThingModels = async (page = 0) => {
    const searchText =
      document.getElementById("search-id").value;
    const attribute =
      document.getElementById("search-option").value;
    setPagination({ ...pagination, currentPage: 0 });

    const thingModels =
      searchText === ""
        ? await fetchThingModels({ page: page })
        : await fetchThingModels({
            page: page,
            attribute: attribute,
            searchText: searchText,
          });
    return setThingModelObjects(
      thingModelToThingModelObjects(thingModels)
    );
  };

  const content = buildForm(
    thingModelObjects,
    pagination.currentPage,
    setChoosenModel,
    setSelectedThingModel,
    searchThingModels,
    paginate,
    show,
    showUrlForm,
    emporioUrl,
    changeThingModelUrl
  );

  if (display) {
    return ReactDOM.createPortal(
      <DialogTemplate
        onCancel={close}
        onSubmit={() => {
          let linkedModel = {};
          linkedModel[choosenModel["title"]] = choosenModel;
          context.updateLinkedTd(undefined);
          context.addLinkedTd(linkedModel);
          context.updateShowConvertBtn(true);
          context.updateOfflineTD(
            JSON.stringify(choosenModel, null, "\t"),
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
  thingModelObjects,
  page,
  setChoosenModel,
  setSelectedThingModel,
  searchThingModels,
  paginate,
  show,
  showUrlForm,
  emporioUrl,
  changeUrl
) => {
  return (
    <>
      <div className="flex">
        <div className="relative w-1/4">
          <select
            className="block appearance-none w-full bg-gray-600 border-2 border-gray-600 text-white py-3 px-4 pr-8 rounded leading-tight focus:border-blue-500 focus:outline-none"
            id="search-option"
            defaultValue="title"
          >
            <option value="title">title</option>
            <option value="description">description</option>
            <option value="type">type</option>
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
          className="text-white bg-blue-500 p-2 rounded-md"
          onClick={() => {
            searchThingModels();
          }}
        >
          Search
        </button>
      </div>
      <button
        className="flex align-top my-1"
        onClick={() => show()}
      >
        <div className="relative w-full bg-gray-600 py-3 px-4 pr-8 rounded-md align-middle">
          <h4 className="whitespace-nowrap text-gray-400">
            Advanced Options
          </h4>
          <div className="pointer-events-none absolute items-center inset-y-0 right-0 flex px-2 text-gray-700">
            {showUrlForm === true ? (
              <ChevronDown color="#cacaca" />
            ) : (
              <ChevronRight color="#cacaca" />
            )}
          </div>
        </div>
      </button>

      {showUrlForm && (
        <div>
          <label className="text-sm text-gray-400 font-medium pl-2">
            TM Repository:
          </label>
          <div className="flex w-fill my-1 ml-2">
            <input
              name="remote-url"
              id="remote-url"
              className="border-gray-600 bg-gray-600 w-full p-2 sm:text-sm border-2 text-white rounded-md focus:outline-none focus:border-blue-500"
              defaultValue={emporioUrl}
              type="url"
            />
            <button
              type="submit"
              className="text-white bg-blue-500 p-2 rounded-md"
              onClick={() => {
                changeUrl();
              }}
            >
              Change
            </button>
          </div>
        </div>
      )}
      {thingModelObjects.map((thingModelObject, index) => (
        <ThingModel
          key={index}
          index={index}
          thingModelObject={thingModelObject}
          setChoosenModel={setChoosenModel}
          setSelectedThingModel={setSelectedThingModel}
        />
      ))}

      <div className="flex justify-center pt-4 p-2">
        <button
          className="text-white bg-gray-500 p-2 mr-1 rounded-md"
          onClick={() => paginate("left")}
        >
          <ChevronLeft color="#cacaca"></ChevronLeft>
        </button>
        <span className="text-white bg-gray-500 p-2 mr-1 rounded-md">
          {" "}
          {page + 1}{" "}
        </span>
        <button
          className="text-white bg-gray-500 p-2 mr-1 rounded-md"
          onClick={() => paginate("right")}
        >
          <ChevronRight color="#cacaca"></ChevronRight>
        </button>
      </div>
    </>
  );
};

const ThingModel = ({
  thingModelObject,
  index,
  setChoosenModel,
  setSelectedThingModel,
}) => {
  const types = formatThingModeltypes(
    thingModelObject.thingModel["@type"]
  );
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
          thingModelObject.selected
            ? "border-blue-500"
            : "border-gray-600"
        }`}
      onClick={() => {
        setSelectedThingModel(index);
        setChoosenModel(thingModelObject.thingModel);
      }}
    >
      <div className="relative">
        <h3 className="px-2">
          {thingModelObject.thingModel.title}
        </h3>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
          {types ? types.map((type) => <p>{type}</p>) : ""}
        </div>
      </div>
      <p className="text-gray-300 py-1 pl-1 my-1">
        {thingModelObject.thingModel.description}
      </p>
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
