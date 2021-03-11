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
import Swal from "sweetalert2";
import "../../assets/main.css"
import ediTDorContext from "../../context/ediTDorContext";
import { buildAttributeListObject, checkIfFormIsInItem, hasForms, separateForms } from "../../util.js"
import addPropertyForm from "./AddPropertyForm";
import Form from "./Form";
import { InfoIconWrapper } from "../InfoIcon/InfoIcon";
import { getFormsTooltipContent } from "../InfoIcon/InfoTooltips";
import { Trash2, PlusCircle } from "react-feather";

const alreadyRenderedKeys = ["title", "forms", "description"];

export default function Property(props) {
    const context = useContext(ediTDorContext);

    if ((Object.keys(props.prop).length === 0 && props.prop.constructor !== Object)) {
        return <div className="text-3xl text-white">Property could not be rendered because mandatory fields are missing.</div>
    }

    const property = props.prop;
    const forms = separateForms(props.prop.forms);

    const attributeListObject = buildAttributeListObject({ name: props.propName }, props.prop, alreadyRenderedKeys);
    const attributes = Object.keys(attributeListObject).map(x => {
        return <li key={x}>{x} : {JSON.stringify(attributeListObject[x])}</li>
    });

    const checkIfFormExists = (form) => {
        if (hasForms(property)) {
            return checkIfFormIsInItem(form, property)
        }
        return false
    }

    const onClickAddForm = async () => {
        const formToAdd = await addPropertyForm()
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
                        context.addForm({ propName: props.propName, form: formToAdd })
                    }
                })
            } else {
                context.addForm({ propName: props.propName, form: formToAdd })
            }
        }
    }

    const onDeletePropertyClicked = () => {
        context.removeOneOfAKindReducer('properties', props.propName)
    }

    return (
        <details>
            <summary className="text-xl text-gray-400 flex-row w-full justify-start items-center">
                <div className="flex-row w-full justify-start items-center">
                <h3 className="flex-grow">{property.title ?? props.propName}</h3>
                <button className="text-base w-6 h-6 p-1 m-1 rounded-full bg-gray-400" onClick={onDeletePropertyClicked}>
                    <Trash2 size={16} color="black" />
                </button>
                </div>
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
                    <button onClick={onClickAddForm}>
                        <PlusCircle color="#cacaca" size="18" />
                    </button>
                </div>
                {forms.map((form, i) => (
                    <Form key={i} propName={props.propName} form={form} interactionType={"property"} className="last:pb-4"></Form>
                ))}
            </div>
        </details >
    )
}