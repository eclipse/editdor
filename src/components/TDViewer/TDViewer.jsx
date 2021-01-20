/********************************************************************************
 * Copyright (c) 2018 - 2020 Contributors to the Eclipse Foundation
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
import React, { useContext } from 'react';
import Property from './Property';
import Action from './Action';
import Event from './Event';
import ediTDorContext from '../../context/ediTDorContext';
import addProperty from './AddProperty';
import addAction from './AddAction';
import addEvent from './AddEvent';
import addGlobalForm from './AddForm';
import { buildAttributeListObject, checkIfFormIsInItem, hasForms, separateForms } from '../../util';
import '../../assets/main.css';
import Form from './Form';
import Swal from 'sweetalert2';
import { InfoIconWrapper } from '../InfoIcon/InfoIcon';
import { getPropertiesTooltipContent, getActionsTooltipContent, getEventsTooltipContent, getFormsTooltipContent } from '../InfoIcon/InfoTooltips';
import { SearchBar } from './SearchBar';
let tdJSON = {};
let first = true;
let firstFilterOfEvents = true;
let firstFilterOfActions = true;
let unfilteredProps = {};
let unfilteredEvents = {};
let unfilteredActions = {};
let oldtdJSON = {};
let error = "";
let sortorder = 'asc';

const JSON_SPACING = 2;

export default function TDViewer() {
    const context = useContext(ediTDorContext);
    try {
        oldtdJSON = tdJSON;
        tdJSON = JSON.parse(context.offlineTD);
        error = '';
    } catch (e) {
        error = e.message;
        tdJSON = oldtdJSON;
    }

    if (!Object.keys(tdJSON).length) {
        return (
            <div className="flex h-full w-full bg-gray-500 justify-center align-center text-center ">
                <div className="text-4xl text-white place-self-center">Start writing a new TD by clicking "New TD"</div>
            </div>
        )
    }

    const onClickAddEvent = async () => {
        const eventToAdd = await addEvent()
        if (eventToAdd) {
            addSubfieldToExistingTD('events', eventToAdd.title, eventToAdd)
        }
    }

    const onClickAddAction = async () => {
        const actionToAdd = await addAction()
        if (actionToAdd) {
            addSubfieldToExistingTD('actions', actionToAdd.title, actionToAdd)
        }
    }

    const onClickAddProp = async () => {
        const propToAdd = await addProperty()
        if (propToAdd) {
            addSubfieldToExistingTD('properties', propToAdd.title, propToAdd)
        }
    }

    const onClickAddGlobalForm = async () => {
        const formToAdd = await addGlobalForm();
        if (formToAdd) {
            if (!hasForms(tdJSON)) {
                tdJSON.forms = [];
            }
            if (checkIfFormIsInItem(formToAdd, tdJSON)) {
                Swal.fire({
                    title: 'Duplication?',
                    html: 'A Form with same fields already exists, are you sure you want to add this?',
                    icon: 'warning',
                    confirmButtonText:
                        'Yes',
                    confirmButtonAriaLabel: 'Yes',
                    showCancelButton: true,
                    cancelButtonText:
                        'No',
                    cancelButtonAriaLabel: 'No'
                }).then(x => {
                    if (x.isConfirmed) {
                        tdJSON.forms.push(formToAdd)
                        context.updateOfflineTD(JSON.stringify(tdJSON, null, JSON_SPACING))
                    }
                })
            }
            tdJSON.forms.push(formToAdd)
            context.updateOfflineTD(JSON.stringify(tdJSON, null, JSON_SPACING))
        }
    }

    const addSubfieldToExistingTD = (type, name, property) => {
        if (!tdJSON[type]) {
            tdJSON[type] = {};
        }
        tdJSON[type][name] = property
        context.updateOfflineTD(JSON.stringify(tdJSON, null, JSON_SPACING))
    }

    let properties;
    let forms;
    let actions;
    let events;
    let metaData;

    if (tdJSON) {
        if (tdJSON.forms) {
            const formsSeparated = separateForms(tdJSON.forms);
            forms = formsSeparated.map((key, index) => {
                return (<Form form={key} propName={index} key={index} />);
            });
        }
        if (tdJSON.properties) {
            properties = Object.keys(tdJSON.properties).map((key, index) => {
                return (<Property base={tdJSON.base}
                    prop={tdJSON.properties[key]} propName={key} key={index} />);
            });
        }
        if (tdJSON.actions) {
            actions = Object.keys(tdJSON.actions).map((key, index) => {
                return (<Action action={tdJSON.actions[key]} actionName={key} key={index} />);
            });
        }
        if (tdJSON.events) {
            events = Object.keys(tdJSON.events).map((key, index) => {
                return (<Event event={tdJSON.events[key]} eventName={key} key={index} />);
            });
        }

        metaData = tdJSON;
    }

    const alreadyRenderedKeys = ["id", "properties", "actions", "events", "forms", "description", "title",];

    const attributeListObject = buildAttributeListObject(tdJSON.id ? { id: tdJSON.id } : {}, tdJSON, alreadyRenderedKeys);

    const attributes = Object.keys(attributeListObject).map(x => {
        return <li key={x}>{x} : {JSON.stringify(attributeListObject[x])}</li>
    });


    const sortKeysInObject = (kind) => {
        const ordered = {};
        const toSort = Object.keys(tdJSON[kind]).map(x => {
            return { key: x, title: tdJSON[kind][x].title }
        })
        if (sortorder === 'asc') {
            toSort.sort((a, b) => {
                const nameA = a.title ? a.title : a.key;
                const nameB = b.title ? b.title : b.key;
                return nameA.localeCompare(nameB)
            }).forEach(function (sortedObject) {
                ordered[sortedObject.key] = tdJSON[kind][sortedObject.key];
            });
            sortorder = 'desc'
        } else {
            toSort.sort((a, b) => {
                const nameA = a.title ? a.title : a.key;
                const nameB = b.title ? b.title : b.key;
                return nameA.localeCompare(nameB)
            }).reverse().forEach(function (sortedObject) {
                ordered[sortedObject.key] = tdJSON[kind][sortedObject.key];
            });
            sortorder = 'asc'
        }
        tdJSON[kind] = ordered
        context.updateOfflineTD(JSON.stringify(tdJSON, null, JSON_SPACING))
    }

    const searchProperties = (event) => {
        if (first) {
            unfilteredProps = tdJSON.properties
            first = false
        }
        let sortedProps = {};
        if (event.target.value.length === 0) {
            sortedProps = unfilteredProps;
        } else {
            Object.keys(unfilteredProps).filter(x => {
                if (x.toLowerCase().indexOf(event.target.value.toLowerCase()) > -1) {
                    return true;
                }
                else {
                    return false;
                }
            }).forEach(y => {
                sortedProps[y] = unfilteredProps[y]
            })
        }
        tdJSON.properties = sortedProps;
        context.updateOfflineTD(JSON.stringify(tdJSON, null, JSON_SPACING))
    }

    const searchActions = (event) => {
        if (firstFilterOfActions) {
            unfilteredActions = tdJSON.actions
            firstFilterOfActions = false
        }
        let sortedActions = {};
        if (event.target.value.length === 0) {
            sortedActions = unfilteredActions;
        } else {
            Object.keys(unfilteredActions).filter(x => {
                if (x.toLowerCase().indexOf(event.target.value.toLowerCase()) > -1) {
                    return true;
                }
                else {
                    return false;
                }
            }).forEach(y => {
                sortedActions[y] = unfilteredActions[y]
            })
        }
        tdJSON.actions = sortedActions;
        context.updateOfflineTD(JSON.stringify(tdJSON, null, JSON_SPACING))
    }

    const searchEvents = (event) => {
        if (firstFilterOfEvents) {
            console.log(first)
            unfilteredEvents = tdJSON.events
            firstFilterOfEvents = false
        }
        let sortedEvents = {};
        if (event.target.value.length === 0) {
            sortedEvents = unfilteredEvents;
        } else {
            Object.keys(unfilteredEvents).filter(x => {
                if (x.toLowerCase().indexOf(event.target.value.toLowerCase()) > -1) {
                    return true;
                }
                else {
                    return false;
                }
            }).forEach(y => {
                sortedEvents[y] = unfilteredEvents[y]
            })
        }
        tdJSON.events = sortedEvents;
        context.updateOfflineTD(JSON.stringify(tdJSON, null, JSON_SPACING))
    }

    const sortedIcon = () => {
        if (sortorder === 'asc') {
            return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ffffff" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 18V4" />
            </svg>
        }

        return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ffffff" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5h4M11 9h7M11 13h10M3 17l3 3 3-3M6 18V4" />
        </svg>)
    }

    return (
        <div className="h-full w-full bg-gray-500 p-8 overflow-scroll overflow-x-hidden">
            {(error.length > 0 && (
                <div className="flex h-10 w-full bg-formRed rounded-md px-4 mt-2 bg-opacity-75 border-2 border-formRed">
                    <div className="flex h-6 w-16 bg-white rounded-md place-self-center justify-center">
                        <div className="text-formRed place-self-center text-center text-xs px-4">Error</div>
                    </div>
                    <div className=" place-self-center pl-3 text-base text-white overflow-hidden">{error}</div>
                </div>))}
            {(metaData !== undefined && Object.keys(metaData).length > 0) && (
                <div>
                    <div className="text-3xl text-white">{metaData.title}</div>
                    <ul className="list-disc text-lg text-gray-400 pt-1 pl-8 ">{attributes}</ul>
                    <div className="text-xl text-white pt-4">{metaData.description}</div>
                </div>)
            }
            <details className="pt-8">
                <summary className="flex justify-start items-center">
                    <div className="flex flex-grow">
                        <InfoIconWrapper tooltip={getFormsTooltipContent()}>
                            <h2 className="text-2xl text-white pr-1 flex-grow">Forms</h2>
                        </InfoIconWrapper>
                    </div>
                    <button className="text-white font-bold text-sm bg-blue-500 cursor-pointer rounded-md p-2" onClick={onClickAddGlobalForm}>Add new Form</button>
                </summary>
                {forms && <div className="pt-4"><div className="rounded-lg bg-gray-600 px-6 pt-4 pb-4">{forms}</div></div>}
            </details>

            <div className="flex justify-start items-end pt-8 pb-4">
                <div className="flex flex-grow">
                    <InfoIconWrapper tooltip={getPropertiesTooltipContent()}>
                        <h2 className="text-2xl text-white pr-1 flex-grow">Properties</h2>
                    </InfoIconWrapper>
                </div>
                <SearchBar
                    onKeyUp={searchProperties}
                    placeholder="Search Properties"
                    ariaLabel="Search through all Properties"
                />
                <div className="w-2"></div>
                <button className="text-white bg-blue-500 cursor-pointer rounded-md p-2 h-9" onClick={() => sortKeysInObject('properties')}>
                    {sortedIcon()}
                </button>
                <div className="w-2"></div>
                <button className="text-white font-bold text-sm bg-blue-500 cursor-pointer rounded-md p-2 h-9" onClick={onClickAddProp}>Add new Property</button>
            </div>
            {properties && <div className="rounded-lg bg-gray-600 px-6 pt-4 pb-4">{properties}</div>}

            <div className="flex justify-between items-end pt-8 pb-4">
                <div className="flex flex-grow">
                    <InfoIconWrapper tooltip={getActionsTooltipContent()}>
                        <h2 className="text-2xl text-white pr-1 flex-grow">Actions</h2>
                    </InfoIconWrapper>
                </div>
                <SearchBar
                    onKeyUp={searchActions}
                    placeholder="Search Actions"
                    ariaLabel="Search through all Actions"
                />
                <div className="w-2"></div>
                <button className="text-white bg-blue-500 cursor-pointer rounded-md p-2 h-9" onClick={() => sortKeysInObject('actions')}>
                    {sortedIcon()}
                </button>
                <div className="w-2"></div>
                <button className="text-white font-bold text-sm bg-blue-500 cursor-pointer rounded-md p-2 h-9" onClick={onClickAddAction}>Add new Action</button>
            </div>
            {actions && <div className="rounded-lg bg-gray-600 px-6 pt-4 pb-4">{actions}</div>}

            <div className="flex justify-between items-end pt-8 pb-4">
                <div className="flex flex-grow">
                    <InfoIconWrapper tooltip={getEventsTooltipContent()}>
                        <h2 className="text-2xl text-white pr-1 flex-grow">Events</h2>
                    </InfoIconWrapper>
                </div>
                <SearchBar
                    onKeyUp={searchEvents}
                    placeholder="Search Events"
                    ariaLabel="Search through all Events"
                />
                <div className="w-2"></div>
                <button className="text-white bg-blue-500 cursor-pointer rounded-md p-2 h-9" onClick={() => sortKeysInObject('events')}>
                    {sortedIcon()}
                </button>
                <div className="w-2"></div>
                <button className="text-white font-bold text-sm bg-blue-500 cursor-pointer rounded-md p-2 h-9" onClick={onClickAddEvent}>Add new Event</button>
            </div>
            {events && <div className="rounded-lg bg-gray-600 px-6 pt-4 pb-4">{events}</div>}
            <div className="h-16"></div>
        </div >
    );
}


