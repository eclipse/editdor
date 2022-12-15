import React, { useContext, useState } from 'react';
import ediTDorContext from '../../context/ediTDorContext';
import { AddActionDialog } from '../Dialogs/AddActionDialog';
import { AddEventDialog } from '../Dialogs/AddEventDialog';
import { AddPropertyDialog } from '../Dialogs/AddPropertyDialog';
import { InfoIconWrapper } from '../InfoIcon/InfoIcon';
import { tooltipMapper } from '../InfoIcon/InfoTooltips';
import Action from './Action';
import Event from './Event';
import Property from './Property';
import { SearchBar } from './SearchBar';
import {tdValidator} from "../../external/TdPlayground";

const SORT_ASC = "asc";
const SORT_DESC = "desc";

let td = {};
let oldTd = {};

/**
 * Renders a section for an interaction (Property, Action, Event) with a
 * search bar, a sorting icon and a button to add a new interaction.
 *
 * The parameter interaction can be one of "Properties", "Actions" or "Events".
 * @param {String} interaction
 */
export const InteractionSection = (props) => {
    const [filter, setFilter] = useState("");
    const [sortOrder, setSortOrder] = useState(SORT_ASC);

    const interaction = props.interaction.toLowerCase();
    const context = useContext(ediTDorContext);

    try {
        oldTd = td;
        const parsedTd = JSON.parse(context.offlineTD);
        td = parsedTd;
    } catch (e) {
        td = oldTd;
    }

    const updateFilter = (event) => setFilter(event.target.value);

    /**
    * Returns an Object containing all interactions with keys
    * matching to the filter.
    */
    const applyFilter = () => {
        if (!td[interaction]) {
            return;
        }

        const filtered = {};
        Object.keys(td[interaction]).filter(e => {
            if (e.toLowerCase().indexOf(filter.toLowerCase()) > -1) {
                return true;
            }
            else {
                return false;
            }
        }).forEach((key) => {
            filtered[key] = td[interaction][key];
        });

        return filtered;
    }

    const sortKeysInObject = (kind) => {
        if (!td[kind]) {
            return;
        }

        const ordered = {};
        const toSort = Object.keys(td[kind]).map(x => {
            return { key: x, title: td[kind][x].title }
        })
        if (sortOrder === SORT_ASC) {
            toSort.sort((a, b) => {
                const nameA = a.title ? a.title : a.key;
                const nameB = b.title ? b.title : b.key;
                return nameA.localeCompare(nameB)
            }).forEach(function (sortedObject) {
                ordered[sortedObject.key] = td[kind][sortedObject.key];
            });
            setSortOrder(SORT_DESC);
        } else {
            toSort.sort((a, b) => {
                const nameA = a.title ? a.title : a.key;
                const nameB = b.title ? b.title : b.key;
                return nameA.localeCompare(nameB)
            }).reverse().forEach(function (sortedObject) {
                ordered[sortedObject.key] = td[kind][sortedObject.key];
            });
            setSortOrder(SORT_ASC);
        }
        td[kind] = ordered
        tdValidator(JSON.stringify(td, null, 2), console.log, {}).then(result => {
            context.updateValidationMessage(result);
            context.updateOfflineTD(JSON.stringify(td, null, 2));
        }, err => {
            console.log("Error");
            console.log(err);
        })



    }

    const sortedIcon = () => {
        if (sortOrder === SORT_ASC) {
            return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ffffff" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 18V4" />
            </svg>
        }

        return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ffffff" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5h4M11 9h7M11 13h10M3 17l3 3 3-3M6 18V4" />
        </svg>)
    }

    const buildChildren = () => {
        const filteredInteractions = applyFilter();

        if (td.properties && interaction === "properties") {
            return Object.keys(filteredInteractions).map((key, index) => {
                return (<Property prop={filteredInteractions[key]} propName={key} key={index} />);
            });
        }
        if (td.actions && interaction === "actions") {
            return Object.keys(filteredInteractions).map((key, index) => {
                return (<Action action={filteredInteractions[key]} actionName={key} key={index} />);
            });
        }
        if (td.events && interaction === "events") {
            return Object.keys(filteredInteractions).map((key, index) => {
                return (<Event event={filteredInteractions[key]} eventName={key} key={index} />);
            });
        }
    }

    const createPropertyDialog = React.useRef();
    const openCreatePropertyDialog = () => { createPropertyDialog.current.openModal() }

    let addInteractionDialog;
    switch (interaction) {
        case 'properties': addInteractionDialog = <AddPropertyDialog ref={createPropertyDialog} />; break;
        case 'actions': addInteractionDialog = <AddActionDialog ref={createPropertyDialog} />; break;
        case 'events': addInteractionDialog = <AddEventDialog ref={createPropertyDialog} />; break;
        default:
    }

    return (
        <>
            <div className="flex justify-start items-end pt-8 pb-4">
                <div className="flex flex-grow">
                    <InfoIconWrapper tooltip={tooltipMapper[interaction]}>
                        <h2 className="text-2xl text-white pr-1 flex-grow">{props.interaction}</h2>
                    </InfoIconWrapper>
                </div>
                <SearchBar
                    onKeyUp={(e) => updateFilter(e)}
                    placeholder={`Search ${props.interaction}`}
                    ariaLabel={`Search through all ${props.interaction}`}
                />
                <div className="w-2"></div>
                <button className="text-white bg-blue-500 cursor-pointer rounded-md p-2 h-9" onClick={() => sortKeysInObject(interaction)}>
                    {sortedIcon()}
                </button>
                <div className="w-2"></div>
                <button className="text-white font-bold text-sm bg-blue-500 cursor-pointer rounded-md p-2 h-9" onClick={openCreatePropertyDialog}>Add</button>
                {addInteractionDialog}
            </div>
            {buildChildren() && <div className="rounded-lg bg-gray-600 px-6 pt-4 pb-4">{buildChildren()}</div>}
        </>
    );
}
