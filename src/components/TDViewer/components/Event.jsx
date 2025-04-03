/********************************************************************************
 * Copyright (c) 2018 - 2022 Contributors to the Eclipse Foundation
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
import { Trash2 } from "react-feather";
import ediTDorContext from "../../../context/ediTDorContext";
import { buildAttributeListObject, separateForms } from "../../../util.js";
import { AddFormDialog } from "../../Dialogs/AddFormDialog";
import { InfoIconWrapper } from "../../InfoIcon/InfoIcon";
import { getFormsTooltipContent } from "../../InfoIcon/InfoTooltips";
import Form, { AddFormElement } from "./Form";

const alreadyRenderedKeys = ["title", "forms", "description"];

export default function Event(props) {
    const context = useContext(ediTDorContext);

    const [isExpanded, setIsExpanded] = useState(false);

    const addFormDialog = React.useRef();
    const openAddFormDialog = () => { addFormDialog.current.openModal() }

    if ((Object.keys(props.event).length === 0 && props.event.constructor !== Object)) {
        return <div className="text-3xl text-white">Event could not be rendered because mandatory fields are missing.</div>
    }

    const event = props.event;
    const forms = separateForms(props.event.forms);
    const attributeListObject = buildAttributeListObject({ name: props.eventName }, props.event, alreadyRenderedKeys);
    const attributes = Object.keys(attributeListObject).map(x => {
        return <li key={x}>{x} : {JSON.stringify(attributeListObject[x])}</li>
    });

    const onDeleteEventClicked = () => {
        context.removeOneOfAKindReducer('events', props.eventName)
    }

    return (
        <details
            className="mb-1"
            open={isExpanded}
            onToggle={() => setIsExpanded(!isExpanded)}
        >
            <summary className={`flex text-xl text-white font-bold pl-2 items-center rounded-t-lg cursor-pointer ${isExpanded ? "bg-gray-500" : ""}`}>
                <div className="flex-grow px-2">{event.title ?? props.eventName}</div>
                {isExpanded &&
                    <button className="flex self-stretch justify-center items-center text-base w-10 h-10 rounded-bl-md rounded-tr-md bg-gray-400" onClick={onDeleteEventClicked}>
                        <Trash2 size={16} color="white" />
                    </button>
                }
            </summary>

            <div className="mb-4 bg-gray-500 px-2 pb-4 rounded-b-lg ">
                {event.description && <div className="text-lg text-gray-400 pb-2 px-2">{event.description}</div>}
                <ul className="text-base text-gray-300 list-disc pl-6">{attributes}</ul>

                <div className="flex justify-start items-center pt-2 pb-2">
                    <InfoIconWrapper className="flex-grow" tooltip={getFormsTooltipContent()}>
                        <h4 className="text-lg text-white pr-1 font-bold">Forms</h4>
                    </InfoIconWrapper>
                </div>

                <AddFormElement onClick={openAddFormDialog} />
                <AddFormDialog
                    type={"event"}
                    interaction={event}
                    interactionName={props.eventName}
                    ref={addFormDialog}
                />
                {forms.map((form, i) => (
                    <Form key={`${i}-${form.href}`} form={form} propName={props.eventName} interactionType={"event"}></Form>
                ))}
            </div>
        </details>
    )
}
