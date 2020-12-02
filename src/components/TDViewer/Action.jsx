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
import React, { useContext } from "react";
import "../../assets/main.css"
import ediTDorContext from "../../context/ediTDorContext";
import { buildAttributeListObject, separateForms } from "../../util.js"
import addActionForm from "./AddActionForm";
import Form from "./Form";

const alreadyRenderedKeys = ["title", "forms", "description"];


export default function Action(props) {
    const context = useContext(ediTDorContext);

    if ((Object.keys(props.action).length === 0 && props.action.constructor !== Object)) {
        return <div className="text-3xl text-white">Action could not be rendered because mandatory fields are missing.</div>
    }

    const action = props.action;
    const forms = separateForms(props.action.forms);
    const attributeListObject = buildAttributeListObject({ name: props.actionName }, props.action, alreadyRenderedKeys);
    const attributes = Object.keys(attributeListObject).map(x => {
        return <li key={x}>{x} : {JSON.stringify(attributeListObject[x])}</li>
    });

    const onClickAddForm = async () => {
        const formToAdd = await addActionForm()
        if (formToAdd) {
            context.addActionForm({ actionName: props.actionName, form: formToAdd })
        }
    }
    return (
        <>
            <details>
                <summary className="text-xl text-gray-400">{action.title ?? props.actionName}</summary>
                <div className="mb-4">
                    <div className="text-lg text-gray-400 pb-2">{action.description}</div>
                    <ul className="text-base text-gray-300 list-disc pl-8">{attributes}</ul>
                    <div className="flex flex-row items-center ">
                        <h2 className="flex-grow text-lg text-gray-400 text-bold">Forms: </h2>
                        <button className="text-lg h-4 w-4 bg-gray-400 rounded-full" onClick={onClickAddForm}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg></button>
                    </div>
                    {forms.map((form, i) => (
                        <Form key={i} form={form} propName={props.actionName} interactionType={"action"}></Form>
                    ))}
                </div>
            </details>
        </>
    )
}