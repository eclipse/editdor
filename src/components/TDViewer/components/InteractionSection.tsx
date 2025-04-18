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

import React, { useContext, useState } from "react";
import PropTypes from "prop-types";
import ediTDorContext from "../../../context/ediTDorContext";
import { AddActionDialog } from "../../Dialogs/AddActionDialog";
import { AddEventDialog } from "../../Dialogs/AddEventDialog";
import { AddPropertyDialog } from "../../Dialogs/AddPropertyDialog";
import { InfoIconWrapper } from "../../InfoIcon/InfoIcon";
import { tooltipMapper } from "../../InfoIcon/InfoTooltips";
import Action from "./Action";
import Event from "./Event";
import Property from "./Property";
import { SearchBar } from "./SearchBar";
import { IForm, IThingDescription } from "types/td";
import EditProperties from "./EditProperties";

const SORT_ASC = "asc";
const SORT_DESC = "desc";

interface IInteractionSectionProps {
  interaction: "Properties" | "Actions" | "Events";
}
/**
 * Renders a section for an interaction (Property, Action, Event) with a
 * search bar, a sorting icon and a button to add a new interaction.
 *
 * The parameter interaction can be one of "Properties", "Actions" or "Events".
 * @param {String} interaction
 */
const InteractionSection: React.FC<IInteractionSectionProps> = (props) => {
  const context = useContext(ediTDorContext);
  const td: IThingDescription = context.parsedTD;

  const [filter, setFilter] = useState("");
  const [sortOrder, setSortOrder] = useState(SORT_ASC);

  const interaction = props.interaction.toLowerCase();

  const updateFilter = (event) => setFilter(event.target.value);

  const isBaseModbus: boolean =
    !!td.base?.includes("modbus://") || !!td.base?.includes("modbus+tcp");

  const hasModbusProperties = (obj: IThingDescription): boolean => {
    if (!obj.properties || Object.keys(obj.properties).length === 0) {
      return false;
    }

    const isHrefModbus = (form: IForm): boolean =>
      form.href.includes("modbus://") || form.href.includes("modbus+tcp://");

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

  const buildChildren = () => {
    const filteredInteractions = applyFilter();

    if (td.properties && interaction === "properties") {
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

  const createPropertyDialog = React.useRef<{ openModal: () => void } | null>(
    null
  );
  const openCreatePropertyDialog = () => {
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

  return (
    <>
      <div className="flex items-end justify-start pb-4 pt-8">
        <div className="flex flex-grow">
          <InfoIconWrapper tooltip={tooltipMapper[interaction]}>
            <h2 className="flex-grow pr-1 text-2xl text-white">
              {props.interaction}
            </h2>
          </InfoIconWrapper>
        </div>
        <SearchBar
          onKeyUp={(e) => updateFilter(e)}
          placeholder={`Search ${props.interaction}`}
          ariaLabel={`Search through all ${props.interaction}`}
        />
        <div className="w-2"></div>
        <button
          className="h-9 cursor-pointer rounded-md bg-blue-500 p-2 text-white"
          onClick={() => sortKeysInObject(interaction)}
        >
          {sortedIcon()}
        </button>
        <div className="w-2"></div>
        <button
          className="h-9 cursor-pointer rounded-md bg-blue-500 p-2 text-sm font-bold text-white"
          onClick={openCreatePropertyDialog}
        >
          Add
        </button>
        {addInteractionDialog}
      </div>

      {interaction === "properties" && hasModbusProperties(td) && (
        <EditProperties isBaseModbus={isBaseModbus} />
      )}
      {buildChildren() && (
        <div className="rounded-lg bg-gray-600 px-4 pb-4 pt-4">
          {buildChildren()}
        </div>
      )}
      {!buildChildren() && (
        <div className="rounded-lg bg-gray-600 px-6 pb-4 pt-4">{}</div>
      )}
    </>
  );
};

InteractionSection.propTypes = {
  interaction: PropTypes.oneOf(["Properties", "Actions", "Events"] as const)
    .isRequired,
};

export default InteractionSection;
