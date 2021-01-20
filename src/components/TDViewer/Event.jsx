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
import { buildAttributeListObject, checkIfFormIsInItem, hasForms, separateForms } from "../../util.js"
import addEventForm from "./AddEventForm";
import Form from "./Form";
import Swal from 'sweetalert2'
import { InfoIconWrapper } from "../InfoIcon/InfoIcon";
import { getFormsTooltipContent } from "../InfoIcon/InfoTooltips";
import { Trash2, PlusCircle } from "react-feather";

const alreadyRenderedKeys = ["title", "forms", "description"];

export default function Event(props) {
    const context = useContext(ediTDorContext);
    if ((Object.keys(props.event).length === 0 && props.event.constructor !== Object)) {
        return <div className="text-3xl text-white">Event could not be rendered because mandatory fields are missing.</div>
    }

    const event = props.event;
    const forms = separateForms(props.event.forms);
    const attributeListObject = buildAttributeListObject({ name: props.eventName }, props.event, alreadyRenderedKeys);
    const attributes = Object.keys(attributeListObject).map(x => {
        return <li key={x}>{x} : {JSON.stringify(attributeListObject[x])}</li>
    });

    const checkIfFormExists = (form) => {
        if (hasForms(event)) {
            return checkIfFormIsInItem(form, event)
        }
        return false
    }

    const onClickAddForm = async () => {
        const formToAdd = await addEventForm()
        if (formToAdd) {
            if (checkIfFormExists(formToAdd)) {
                Swal.fire({
                    title: 'Duplication?',
                    html: 'A Form with same fields already exists, are you sure you want to add this?',
                    icon: 'warning',
                    confirmButtonText: 'Yes',
                    confirmButtonAriaLabel: 'Yes',
                    showCancelButton: true,
                    cancelButtonText: 'No',
                    cancelButtonAriaLabel: 'No'
                }).then(x => {
                    if (x.isConfirmed) {
                        context.addEventForm({ eventName: props.eventName, form: formToAdd })
                    }
                })
            } else {
                context.addEventForm({ eventName: props.eventName, form: formToAdd })
            }
        }
    }

    const onDeleteEventClicked = () => {
        context.removeOneOfAKindReducer('events', props.eventName)
    }

    return (
        <details>
            <summary className="text-xl text-gray-400 flex flex-row justify-start items-center">
                <div className="flex-grow">{event.title ?? props.eventName}</div>
                <button className="text-base w-6 h-6 p-1 m-1 rounded-full bg-gray-400" onClick={onDeleteEventClicked}>
                    <Trash2 size={16} color="black" />
                </button>
            </summary>
            <div className="mb-4">
                <div className="text-lg text-gray-400 pb-2">{event.description}</div>
                <ul className="text-base text-gray-300 list-disc pl-8">{attributes}</ul>
                <div className="flex flex-row items-center ">
                    <div className="flex flex-grow">
                        <InfoIconWrapper className=" flex-grow" tooltip={getFormsTooltipContent()}>
                            <h4 className="text-lg text-gray-400 pr-1 text-bold">Forms</h4>
                        </InfoIconWrapper>
                    </div>
                    <button onClick={onClickAddForm}>
                        <PlusCircle color="#cacaca" size="18" />
                    </button>
                </div>
                {forms.map((form, i) => (
                    <Form key={i} form={form} propName={props.eventName} interactionType={"event"}></Form>
                ))}
            </div>
        </details>
    )
}