/********************************************************************************
 * Copyright (c) 2018 - 2021 Contributors to the Eclipse Foundation
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
import "../../assets/main.css";
import ediTDorContext from "../../context/ediTDorContext";
import { buildAttributeListObject, separateForms } from "../../util.js";
import { AddFormDialog } from "../Dialogs/AddFormDialog";
import { InfoIconWrapper } from "../InfoIcon/InfoIcon";
import { getFormsTooltipContent } from "../InfoIcon/InfoTooltips";
import Form from "./Form";

const alreadyRenderedKeys = ["title", "forms", "description"];

export default function Property(props) {
    const context = useContext(ediTDorContext);

    const addFormDialog = React.useRef()
    const openAddFormDialog = () => { addFormDialog.current.openModal() }

    if ((Object.keys(props.prop).length === 0 && props.prop.constructor !== Object)) {
        return <div className="text-3xl text-white">Property could not be rendered because mandatory fields are missing.</div>
    }

    const property = props.prop;
    const forms = separateForms(props.prop.forms);

    const attributeListObject = buildAttributeListObject({ name: props.propName }, props.prop, alreadyRenderedKeys);
    const attributes = Object.keys(attributeListObject).map(x => {
        return <li key={x}>{x} : {JSON.stringify(attributeListObject[x])}</li>
    });

    const onDeletePropertyClicked = () => {
        context.removeOneOfAKindReducer('properties', props.propName)
    }

    return (
        <details>
            <summary className="text-xl text-gray-400 flex flex-row w-full justify-start items-center cursor-pointer p-0.5">
                <h3 className="flex-grow">{property.title ?? props.propName}</h3>
                <button className="text-base w-6 h-6 p-1 m-1 rounded-full bg-gray-400" onClick={onDeletePropertyClicked}>
                    <Trash2 size={16} color="black" />
                </button>
            </summary>
            <div className="mb-4">
                <div className="text-lg text-gray-400 pb-2">{property.description}</div>
                <ul className="list-disc text-base text-gray-300 pl-8">{attributes}</ul>
                <div className="flex justify-start items-center pt-2">
                    <div className="flex flex-grow">
                        <InfoIconWrapper className=" flex-grow" tooltip={getFormsTooltipContent()}>
                            <h4 className="text-lg text-gray-400 pr-1 text-bold">Forms</h4>
                        </InfoIconWrapper>
                    </div>
                    <button onClick={openAddFormDialog}>
                        <PlusCircle color="#cacaca" size="18" />
                    </button>
                    <AddFormDialog type="property"
                        interaction={property}
                        interactionName={props.propName}
                        ref={addFormDialog}
                    />
                </div>
                {forms.map((form, i) => (
                    <Form key={i} propName={props.propName} form={form} interactionType={"property"} className="last:pb-4"></Form>
                ))}
            </div>
        </details >
    )
}