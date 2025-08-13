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

import React, { useContext, useState } from "react";
import ediTDorContext from "../../../context/ediTDorContext";
import AddActionDialog from "../../Dialogs/AddActionDialog";
import AddEventDialog from "../../Dialogs/AddEventDialog";
import { AddPropertyDialog } from "../../Dialogs/AddPropertyDialog";
import InfoIconWrapper from "../../InfoIcon/InfoIconWrapper";
import { tooltipMapper } from "../../InfoIcon/TooltipMapper";
import Action from "./Action";
import Event from "./Event";
import Property from "./Property";
import SearchBar from "./SearchBar";
import EditProperties from "./EditProperties";
import BaseTable from "../base/BaseTable";
import DialogTemplate from "./../../Dialogs/DialogTemplate";
import Editor from "@monaco-editor/react";
import { readProperty } from "../../../services/form";
import { extractIndexFromId, formatText } from "../../../utils/strings";
import BaseButton from "../base/BaseButton";
import type {
  FormElementBase,
  ThingDescription,
} from "wot-thing-description-types";
const SORT_ASC = "asc";
const SORT_DESC = "desc";

interface IInteractionSectionProps {
  interaction: "Properties" | "Actions" | "Events";
}

type InteractionKey = "properties" | "actions" | "events";

/**
 * Renders a section for an interaction (Property, Action, Event) with a
 * search bar, a sorting icon and a button to add a new interaction.
 *
 * The parameter interaction can be one of "Properties", "Actions" or "Events".
 * @param {String} interaction
 */
const InteractionSection: React.FC<IInteractionSectionProps> = (props) => {
  const context = useContext(ediTDorContext);
  const td: ThingDescription = context.isValidJSON
    ? JSON.parse(context.offlineTD)
    : {};
  const [filter, setFilter] = useState("");
  const [sortOrder, setSortOrder] = useState(SORT_ASC);
  const createPropertyDialog = React.useRef<{ openModal: () => void } | null>(
    null
  );
  const [modeView, setModeView] = useState<"table" | "list">("list");
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control dialog visibility
  const [editorContent, setEditorContent] = useState<{
    editorState: string;
    propName: string;
    formsIndex: number;
    state: "viewProperty" | "viewPropertyElementForm" | "sendRequest";
    title: string;
  }>({
    editorState: "",
    propName: "",
    formsIndex: 0,
    state: "viewProperty",
    title: "Edit Property",
  }); // State to manage editor content

  const interaction = props.interaction.toLowerCase() as InteractionKey;

  const updateFilter = (event) => setFilter(event.target.value);

  const isBaseModbus: boolean =
    !!td.base?.includes("modbus://") || !!td.base?.includes("modbus+tcp");

  const hasModbusProperties = (obj: ThingDescription): boolean => {
    if (!obj.properties || Object.keys(obj.properties).length === 0) {
      return false;
    }

    const isHrefModbus = (form: FormElementBase): boolean => {
      if (!form.href) {
        return false;
      } else {
        return (
          form.href.includes("modbus://") || form.href.includes("modbus+tcp://")
        );
      }
    };

    return (
      isBaseModbus ||
      Object.values(obj.properties).some((property) =>
        property.forms?.some((form) => isHrefModbus(form))
      )
    );
  };

  /**
   * Returns an Object containing all interactions with keys
   * matching to the filter.
   */
  const applyFilter = () => {
    if (!td[interaction]) {
      return {};
    }

    const filtered = {};
    // TODO: enable search also by title not only by interaction name
    Object.keys(td[interaction])
      .filter((e) => {
        if (e.toLowerCase().indexOf(filter.toLowerCase()) > -1) {
          return true;
        } else {
          return false;
        }
      })
      .forEach((key) => {
        filtered[key] = td[interaction][key];
      });

    return filtered;
  };

  const sortKeysInObject = (kind) => {
    if (!td[kind]) {
      return;
    }

    const ordered = {};
    const toSort = Object.keys(td[kind]).map((x) => {
      return { key: x, title: td[kind][x].title };
    });
    if (sortOrder === SORT_ASC) {
      toSort
        .sort((a, b) => {
          const nameA = a.title ? a.title : a.key;
          const nameB = b.title ? b.title : b.key;
          return nameA.localeCompare(nameB);
        })
        .forEach(function (sortedObject) {
          ordered[sortedObject.key] = td[kind][sortedObject.key];
        });
      setSortOrder(SORT_DESC);
    } else {
      toSort
        .sort((a, b) => {
          const nameA = a.title ? a.title : a.key;
          const nameB = b.title ? b.title : b.key;
          return nameA.localeCompare(nameB);
        })
        .reverse()
        .forEach(function (sortedObject) {
          ordered[sortedObject.key] = td[kind][sortedObject.key];
        });
      setSortOrder(SORT_ASC);
    }
    td[kind] = ordered;
    context.updateOfflineTD(JSON.stringify(td, null, 2));
  };

  const sortedIcon = () => {
    if (sortOrder === SORT_ASC) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="#ffffff"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 18V4" />
        </svg>
      );
    }

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="#ffffff"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11 5h4M11 9h7M11 13h10M3 17l3 3 3-3M6 18V4" />
      </svg>
    );
  };

  const handleOnClickSendRequest = async (item: {
    [key: string]: any;
  }): Promise<{ value: string; error: string }> => {
    const index = extractIndexFromId(item.id);

    try {
      const res = await readProperty(td, item.propName, {
        formIndex: index,
      });
      if (res.err) {
        return { value: "", error: res.err.message };
      }
      return { value: res.result, error: "" };
    } catch (err: any) {
      return { value: "", error: err.message };
    }
  };

  const handleCellClick = (
    item: { [key: string]: any },
    headerKey: string,
    value: any
  ) => {
    const index = extractIndexFromId(item.id);
    try {
      td[interaction as InteractionKey][item.propName].forms[index][headerKey] =
        value;
    } catch (e) {
      console.error(e);
    }
    context.updateOfflineTD(JSON.stringify(td, null, 2));
  };

  const handleOnRowClick = (
    item: { [key: string]: any },
    state: "viewProperty" | "viewPropertyElementForm"
  ) => {
    const index = extractIndexFromId(item.id);
    let value: any;

    if (state === "viewPropertyElementForm") {
      value = td[interaction][item.propName].forms[index];
    } else {
      try {
        value = { [item.propName]: td[interaction][item.propName] };
        //value = td[interaction][item.propName].forms[index];
      } catch (e) {
        console.error(e);
      }
    }

    setEditorContent({
      editorState: JSON.stringify(value, null, 2),
      propName: item.propName,
      formsIndex: index,
      state: state,
      title:
        state === "viewProperty"
          ? editorContent.title
          : `Edit form number ${index + 1} of property ${item.propName}`,
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditorContent({
      editorState: "",
      propName: "",
      formsIndex: 0,
      state: "viewProperty",
      title: "Edit Property",
    });
    setIsDialogOpen(false);
  };

  const handleDialogSubmit = () => {
    let value = JSON.parse(editorContent.editorState);
    if (editorContent.state === "viewProperty") {
      td[interaction][editorContent.propName] = value[editorContent.propName];
    } else {
      td[interaction][editorContent.propName].forms[editorContent.formsIndex] =
        value;
    }

    context.updateOfflineTD(JSON.stringify(td, null, 2));

    setIsDialogOpen(false);

    setEditorContent({
      editorState: "",
      propName: "",
      formsIndex: 0,
      state: "viewProperty",
      title: "Edit Property",
    });
  };

  const buildChildren = () => {
    const filteredInteractions = applyFilter();

    if (td.properties && interaction === "properties") {
      if (modeView === "list") {
        return Object.keys(filteredInteractions).map((key, index) => {
          return (
            <Property
              prop={filteredInteractions[key]}
              propName={key}
              key={index}
            />
          );
        });
      }

      const headers: { key: string; text: string }[] = Object.keys(
        filteredInteractions
      ).length
        ? [
            ...["id", "description", "propName", "editForm", "previewValue"],
            ...[
              ...new Set(
                Object.keys(filteredInteractions).flatMap((key) => {
                  const forms = filteredInteractions[key].forms || [];
                  return forms.flatMap((form: FormElementBase) =>
                    Object.keys(form)
                  );
                })
              ),
            ],
          ].map((key) => ({
            key,
            text: formatText(key),
          }))
        : [];

      const items = Object.keys(filteredInteractions).flatMap((key) => {
        const forms = filteredInteractions[key].forms || [];
        return forms.map((form: FormElementBase, index: number) => ({
          id: `${key} - ${index}`,
          description: filteredInteractions[key].description ?? "",
          propName: key,
          ...form,
        }));
      });

      let filteredItems = items.filter((form: FormElementBase) => {
        if (Array.isArray(form.op)) {
          return form.op.includes("readproperty");
        }
        return form.op === "readproperty";
      });

      let filteredHeaders = headers
        .filter((header) => header.key !== "op")
        .filter((header) => header.key !== "id")
        .filter((header) => header.key !== "description");

      if (isBaseModbus) {
        filteredHeaders = filteredHeaders.filter(
          (header) => header.key !== "href"
        );
      }

      return (
        <BaseTable
          headers={filteredHeaders}
          items={filteredItems}
          itemsPerPage={10}
          orderBy=""
          order="asc"
          onCellClick={handleCellClick}
          onRowClick={handleOnRowClick}
          onSendRequestClick={handleOnClickSendRequest}
          baseUrl={td.base ?? ""}
        />
      );
    }
    if (td.actions && interaction === "actions") {
      return Object.keys(filteredInteractions).map((key, index) => {
        return (
          <Action
            action={filteredInteractions[key]}
            actionName={key}
            key={index}
          />
        );
      });
    }
    if (td.events && interaction === "events") {
      return Object.keys(filteredInteractions).map((key, index) => {
        return (
          <Event
            event={filteredInteractions[key]}
            eventName={key}
            key={index}
          />
        );
      });
    }
  };

  const handleOpenCreatePropertyDialog = () => {
    if (createPropertyDialog.current) {
      createPropertyDialog.current.openModal();
    }
  };

  let addInteractionDialog;
  switch (interaction) {
    case "properties":
      addInteractionDialog = <AddPropertyDialog ref={createPropertyDialog} />;
      break;
    case "actions":
      addInteractionDialog = <AddActionDialog ref={createPropertyDialog} />;
      break;
    case "events":
      addInteractionDialog = <AddEventDialog ref={createPropertyDialog} />;
      break;
    default:
  }

  const childrenContent = buildChildren();

  return (
    <>
      <div className="flex items-end justify-start pb-4 pt-8">
        <div className="flex flex-grow">
          <InfoIconWrapper
            tooltip={tooltipMapper[interaction]}
            id={interaction}
          >
            <h2 className="flex-grow pr-1 text-2xl text-white">
              {props.interaction}
            </h2>
          </InfoIconWrapper>
          <div>
            {interaction === "properties" && (
              <BaseButton
                onClick={() => setModeView("list")}
                variant="primary"
                type="button"
                className="h-9"
              >
                List
              </BaseButton>
            )}
            {interaction === "properties" && (
              <BaseButton
                onClick={() => setModeView("table")}
                variant="primary"
                type="button"
                className="ml-2 h-9"
              >
                Table
              </BaseButton>
            )}
          </div>
        </div>
        <SearchBar
          onKeyUp={(e) => updateFilter(e)}
          placeholder={`Search ${props.interaction}`}
          ariaLabel={`Search through all ${props.interaction}`}
        />
        <div className="w-2"></div>
        <BaseButton
          onClick={() => sortKeysInObject(interaction)}
          variant="primary"
          type="button"
          className="h-9"
        >
          {sortedIcon()}
        </BaseButton>
        <div className="w-2"></div>
        <BaseButton
          onClick={handleOpenCreatePropertyDialog}
          variant="primary"
          type="button"
          className="h-9"
        >
          Add
        </BaseButton>
        {addInteractionDialog}
      </div>

      {interaction === "properties" && hasModbusProperties(td) && (
        <EditProperties isBaseModbus={hasModbusProperties(td)} />
      )}

      {childrenContent && (
        <div className="rounded-lg bg-gray-600 px-4 pb-4 pt-4">
          {childrenContent ? childrenContent : <div className="px-6">{}</div>}
        </div>
      )}

      {/* Dialog Template */}
      {isDialogOpen && (
        <DialogTemplate
          title={editorContent.title}
          description="Modify the content using this editor"
          onCancel={handleDialogClose}
          onSubmit={handleDialogSubmit}
          submitText="Save"
        >
          <Editor
            height="400px"
            defaultLanguage="json"
            value={editorContent.editorState}
            onChange={(value) =>
              setEditorContent({
                ...editorContent,
                editorState: value || "",
              })
            } // Update editor content
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
            theme="vs-dark"
          />
        </DialogTemplate>
      )}
    </>
  );
};

export default InteractionSection;
