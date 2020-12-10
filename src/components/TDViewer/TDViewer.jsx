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
import { buildAttributeListObject, separateForms } from '../../util';
import '../../assets/main.css'
import Form from './Form';
let tdJSON = {};
let oldtdJSON = {};
let error = "";
let sortorder = 'asc';

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

    const addSubfieldToExistingTD = (type, name, property) => {
        if (!tdJSON[type]) {
            tdJSON[type] = {};
        }
        tdJSON[type][name] = property
        context.updateOfflineTD(JSON.stringify(tdJSON, null, 2))
    }

    let properties;
    let forms;
    let actions;
    let events;
    let metaData;

    if (tdJSON) {
        if (tdJSON.forms) {
            const formsSeperated = separateForms(tdJSON.forms);
            forms = formsSeperated.map((key, index) => {
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

    const alreadyRenderedKeys = ["id", "properties", "actions", "events", "description", "title",];

    const attributeListObject = buildAttributeListObject(tdJSON.id ? { id: tdJSON.id } : {}, tdJSON, alreadyRenderedKeys);

    const attributes = Object.keys(attributeListObject).map(x => {
        return <li key={x}>{x} : {JSON.stringify(attributeListObject[x])}</li>
    });


    const sortKeysInObject = () => {
        const ordered = {};
        if (sortorder === 'asc') {
            Object.keys(tdJSON.properties).sort().forEach(function (key) {
                ordered[key] = tdJSON.properties[key];
            });
            sortorder = 'desc'
        } else {
            Object.keys(tdJSON.properties).sort().reverse().forEach(function (key) {
                ordered[key] = tdJSON.properties[key];
            });
            sortorder = 'asc'
        }
        tdJSON.properties = ordered
        context.updateOfflineTD(JSON.stringify(tdJSON, null, 2))
    }

    const sortedIcon = () => {
        if (sortorder === 'asc') {
            return (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M6 22l6-8h-4v-12h-4v12h-4l6 8zm11.694-19.997h2.525l3.781 10.997h-2.421l-.705-2.261h-3.935l-.723 2.261h-2.336l3.814-10.997zm-.147 6.841h2.736l-1.35-4.326-1.386 4.326zm-.951 11.922l3.578-4.526h-3.487v-1.24h5.304v1.173l-3.624 4.593h3.633v1.234h-5.404v-1.234z" />
            </svg>)
        } else {
            return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M6 2l-6 8h4v12h4v-12h4l-6-8zm11.694.003h2.525l3.781 10.997h-2.421l-.705-2.261h-3.935l-.723 2.261h-2.336l3.814-10.997zm-.147 6.841h2.736l-1.35-4.326-1.386 4.326zm-.951 11.922l3.578-4.526h-3.487v-1.24h5.304v1.173l-3.624 4.593h3.633v1.234h-5.404v-1.234z" />
            </svg>
        }
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
            <details>
                <summary className="flex justify-start items-center pt-8 pb-4">
                    <div className="flex flex-row justify-start items-end flex-grow">
                        <div className="text-2xl text-white mr-4">Forms</div>
                        <button className="text-white bg-blue-500 cursor-pointer rounded-md p-2" onClick={sortKeysInObject}>
                            {sortedIcon()}
                        </button>
                    </div>
                    <button className="text-white font-bold text-sm bg-blue-500 cursor-pointer rounded-md p-2" onClick={onClickAddProp}>Add new Form</button>
                </summary>
                {
                    forms && (
                        <>
                            <div className="rounded-lg bg-gray-600 px-6 pt-4 pb-4">{forms}</div>
                        </>)
                }
            </details>

            <div className="flex justify-start items-end pt-8 pb-4">
                <div className="flex flex-row justify-start items-end flex-grow">
                    <div className="text-2xl text-white mr-4">Properties</div>
                    <button className="text-white bg-blue-500 cursor-pointer rounded-md p-2" onClick={sortKeysInObject}>
                        {sortedIcon()}
                    </button>
                </div>
                <button className="text-white font-bold text-sm bg-blue-500 cursor-pointer rounded-md p-2" onClick={onClickAddProp}>Add new Property</button>
            </div>
            {
                properties && (
                    <>
                        <div className="rounded-lg bg-gray-600 px-6 pt-4 pb-4">{properties}</div>
                    </>)
            }

            <div className="flex justify-between items-end pt-8 pb-4">
                <div className="text-2xl text-white pl-1">Actions</div>
                <div className="text-white font-bold text-sm bg-blue-500 cursor-pointer rounded-md p-2" onClick={onClickAddAction}>Add new Action</div>
            </div>
            {
                actions && (
                    <>
                        <div className="rounded-lg bg-gray-600 px-6 pt-4 pb-4">{actions}</div>
                    </>)
            }

            <div className="flex justify-between items-end pt-8 pb-4">
                <div className="text-2xl text-white">Events</div>
                <div className="text-white font-bold text-sm bg-blue-500 cursor-pointer rounded-md p-2" onClick={onClickAddEvent}>Add new Event</div>
            </div>
            {
                events && (
                    <>
                        <div className="rounded-lg bg-gray-600 px-6 pt-4 pb-4">{events}</div>
                    </>)
            }
            <div className="h-16"></div>
        </div >
    );
}


