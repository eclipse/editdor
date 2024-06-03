/********************************************************************************
 * Copyright (c) 2018 - 2024 Contributors to the Eclipse Foundation
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
import { PlusCircle, Trash2 } from "react-feather";
import ediTDorContext from "../../../context/ediTDorContext";
import { buildAttributeListObject, separateForms } from "../../../util.js";
import { AddFormDialog } from "../../Dialogs/AddFormDialog";
import { InfoIconWrapper } from "../../InfoIcon/InfoIcon";
import { getFormsTooltipContent } from "../../InfoIcon/InfoTooltips";
import Form from "./Form";

const alreadyRenderedKeys = ["title", "forms", "description"];

export default function Action(props) {
    const context = useContext(ediTDorContext);

    const addFormDialog = React.useRef();
    const openAddFormDialog = () => { addFormDialog.current.openModal() }

    if ((Object.keys(props.action).length === 0 && props.action.constructor !== Object)) {
        return <div className="text-3xl text-white">Action could not be rendered because mandatory fields are missing.</div>
    }

    const action = props.action;
    const forms = separateForms(props.action.forms);
    const attributeListObject = buildAttributeListObject({ name: props.actionName }, props.action, alreadyRenderedKeys);
    const attributes = Object.keys(attributeListObject).map(x => {
        return <li key={x}>{x} : {JSON.stringify(attributeListObject[x])}</li>
    });

    const onDeleteActionClicked = () => {
        context.removeOneOfAKindReducer('actions', props.actionName)
    }

    return (
        <details>
            <summary className="text-xl text-gray-400 flex flex-row justify-start items-center cursor-pointer p-0.5">
                <div className="flex-grow">{action.title ?? props.actionName}</div>
                <button className="text-base w-6 h-6 p-1 m-1 rounded-full bg-gray-400" onClick={onDeleteActionClicked}>
                    <Trash2 size={16} color="black" />
                </button>
            </summary>
            <div className="mb-4">
                <div className="text-lg text-gray-400 pb-2">{action.description}</div>
                <ul className="text-base text-gray-300 list-disc pl-8">{attributes}</ul>
                <div className="flex flex-row items-center ">
                    <div className="flex flex-grow">
                        <InfoIconWrapper className=" flex-grow" tooltip={getFormsTooltipContent()}>
                            <h4 className="text-lg text-gray-400 pr-1 text-bold">Forms</h4>
                        </InfoIconWrapper>
                    </div>
                    <button onClick={openAddFormDialog}>
                        <PlusCircle color="#cacaca" size="18" />
                    </button>
                    <AddFormDialog type="action"
                        interaction={action}
                        interactionName={props.actionName}
                        ref={addFormDialog}
                    />
                </div>
                {forms.map((form, i) => (
                    <Form key={i} form={form} propName={props.actionName} interactionType={"action"}></Form>
                ))}
            </div>
        </details>
    )
}
