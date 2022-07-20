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
  useReducer,
} from "react";
import ReactDOM from "react-dom";
import { DialogTemplate } from "./DialogTemplate";
import { AdvancedOptions } from "./components/AdvancedOptions"
import ediTDorContext from "../../context/ediTDorContext";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from "react-feather";

function tmReducer(state, action) {
  switch (action.type) {
    case "thingModels": {
      return {
        ...state,
        thingModels: action.payload.map((thingModel) => {
          return { thingModel: thingModel, select: false };
        }),
      };
    }
    case "selected": {
      const index = action.payload;
      let choosenModel;
      const thingModels = state.thingModels.map(
        (thingObject, thingIndex) => {
          if (thingIndex === index) {
            thingObject.selected = true;
            choosenModel = thingObject.thingModel;
          } else thingObject.selected = false;
          return thingObject;
        }
      );
      return {
        ...state,
        thingModels: thingModels,
        choosenModel: choosenModel,
      };
    }
    case "changePage": {
      const pagination = {
        ...state.pagination,
        currentPage: action.payload,
      };
      return {
        ...state,
        pagination: pagination,
      };
    }
    case "reset": {
      const pagination = {
        ...state.pagination,
        currentPage: 0,
      };
      return {
        ...state,
        pagination: pagination,
      };
    }
    case "field": {
      return {
        ...state,
        [action.fieldName]: action.payload,
      };
    }
    default:
      throw Error(
        "Unexected reducer case in Thing Model Modal"
      );
  }
}

const initialState = {
  thingModels: [],
  choosenModel: null,
  pagination: {
    currentPage: 0,
    thingModelsPerPage: 5,
  },
};

export const LoadTmDialog = forwardRef((props, ref) => {
  const context = useContext(ediTDorContext);

  const [display, setDisplay] = React.useState(() => {
    return false;
  });
  const [state, dispatch] = useReducer(
    tmReducer,
    initialState
  );

  const {
    thingModels,
    choosenModel,
    pagination,
  } = state;

  useImperativeHandle(ref, () => {
    return {
      openModal: () => open(),
      close: () => close(),
    };
  });

  const open = async () => {
    dispatch({
      type: "thingModels",
      payload: await fetchThingModels(),
    });
    dispatch({ type: "reset", payload: 0 });
    setDisplay(true);
  };

  const close = () => {
    setDisplay(false);
  };

  const setSelectedThingModel = (index) => {
    dispatch({ type: "selected", payload: index });
  };

  const fetchThingModels = async ({
    page = 0,
    attribute = false,
    searchText,
    remoteUrl = context.tmRepositoryUrl,
  } = {}) => {
    const offset = pagination.thingModelsPerPage * page;
    let url = `${remoteUrl}/models?limit=${pagination.thingModelsPerPage}&offset=${offset}`;
    if (attribute) url += `&${attribute}=${searchText}`;
    const res = await fetch(url);
    const data = await res.json();
    return data;
  };

  const paginate = async (direction) => {
    const page =
      direction === "right"
        ? pagination.currentPage + 1
        : pagination.currentPage - 1;
    if (page < 0) return;

    const searchText =
      document.getElementById("search-id").value;
    const attribute =
      document.getElementById("search-option").value;

    const thingModels =
      searchText === ""
        ? await fetchThingModels({ page: page })
        : await fetchThingModels({
            page: page,
            attribute: attribute,
            searchText: searchText,
          });
    if (thingModels.length <= 0) return;

    dispatch({
      type: "thingModels",
      payload: thingModels,
    });
    dispatch({ type: "changePage", payload: page });
  };

  const changeThingModelUrl = async () => {
    const url = document.getElementById("remote-url").value;
    try {
      const thingModels = await fetchThingModels({
        remoteUrl: url,
      });
      context.updateTmRepositoryUrl(url);

      return dispatch({
        type: "thingModels",
        payload: thingModels,
      });
    } catch (error) {
      const msg = `Error processing URL - Thing Model Repository was not found`;
      alert(msg);
    }
  };
  const searchThingModels = async () => {
    const searchText =
      document.getElementById("search-id").value;
    const attribute =
      document.getElementById("search-option").value;

    //TODO: is that right?
    dispatch({ type: "reset" });

    const thingModels =
      searchText === ""
        ? await fetchThingModels()
        : await fetchThingModels({
            page: 0,
            attribute: attribute,
            searchText: searchText,
          });
    return dispatch({
      type: "thingModels",
      payload: thingModels,
    });
  };

  const content = buildForm(
    thingModels,
    pagination.currentPage,
    setSelectedThingModel,
    searchThingModels,
    paginate,
    changeThingModelUrl
  );

  if (display) {
    return ReactDOM.createPortal(
      <DialogTemplate
        onCancel={close}
        onSubmit={() => {
          if (choosenModel === null) return;
          let linkedModel = {};
          linkedModel[choosenModel["title"]] = choosenModel;
          context.updateLinkedTd(undefined);
          context.addLinkedTd(linkedModel);
          context.updateShowConvertBtn(true);
          context.updateIsThingModel(true);
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
  setSelectedThingModel,
  searchThingModels,
  paginate,
  changeUrl
) => {
  return (
    <>
      <SearchBar searchThingModels={searchThingModels} />

      <AdvancedOptions
        changeUrl={changeUrl}
      />

      {thingModelObjects.map((thingModelObject, index) => (
        <ThingModel
          key={index}
          index={index}
          thingModelObject={thingModelObject}
          setSelectedThingModel={setSelectedThingModel}
        />
      ))}

      <Pagination paginate={paginate} page={page} />
    </>
  );
};

const SearchBar = ({ searchThingModels }) => {
  return (
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
  );
};

const Pagination = ({ paginate, page }) => {
  return (
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
  );
};

const ThingModel = ({
  thingModelObject,
  index,
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
