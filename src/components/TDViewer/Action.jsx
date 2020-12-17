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
import Swal from 'sweetalert2'

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

    const checkIfFormExists = (form) => {
        if (action.forms) {
            for (const element of action.forms) {
                for (const x of form.op) {
                    if (typeof (element.op) === 'string') {
                        if (element.op === x.op) {
                            return true;
                        }
                    } else {
                        if (element.op.includes(x)) {
                            let deepCompare = true;
                            for (const y in form) {
                                if (y !== 'op') {
                                    if (element[y] !== form[y]) {
                                        deepCompare = false;
                                    }
                                }
                            }
                            if (deepCompare)
                                return true
                        }
                    }
                }
            }
        }
        return false
    }

    const onClickAddForm = async () => {
        const formToAdd = await addActionForm()
        if (formToAdd) {
            if (checkIfFormExists(formToAdd)) {
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
                        context.addActionForm({ actionName: props.actionName, form: formToAdd })
                    }
                })
            } else {
                context.addActionForm({ actionName: props.actionName, form: formToAdd })
            }
        }
    }

    const onDeleteActionClicked = () => {
        context.removeOneOfAKindReducer('actions', props.actionName)
    }

    return (
        <>
            <details>
                <summary className="text-xl text-gray-400 flex flex-row justify-start items-center">
                    <div className="flex-grow">{action.title ?? props.actionName}</div>
                    <button className="text-base w-6 h-6 p-1 m-1 shadow-md rounded-full bg-gray-400" onClick={onDeleteActionClicked}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="text-black">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                </summary>
                <div className="mb-4">
                    <div className="text-lg text-gray-400 pb-2">{action.description}</div>
                    <ul className="text-base text-gray-300 list-disc pl-8">{attributes}</ul>
                    <div className="flex flex-row items-center ">
                        <h2 className="flex-grow text-lg text-gray-400 text-bold">Forms</h2>
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