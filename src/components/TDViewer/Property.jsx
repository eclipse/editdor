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
import Swal from "sweetalert2";
import "../../assets/main.css"
import ediTDorContext from "../../context/ediTDorContext";
import { buildAttributeListObject, separateForms } from "../../util.js"
import addPropertyForm from "./AddPropertyForm";
import Form from "./Form";

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
        for (const element of property.forms) {
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
                    confirmButtonText:
                        'Yes',
                    confirmButtonAriaLabel: 'Yes',
                    showCancelButton: true,
                    cancelButtonText:
                        'No',
                    cancelButtonAriaLabel: 'No'
                }).then(x => {
                    if(x.isConfirmed) {
                        context.addForm({ propName: props.propName, form: formToAdd })
                    }
                })
            } else {
                context.addForm({ propName: props.propName, form: formToAdd })
            }
        }
    }

    return (
        <>
            <details>
                <summary className="text-xl text-gray-400 ">{property.title ?? props.propName}</summary>
                <div className="mb-4">

                    <div className="text-lg text-gray-400 pb-2">{property.description}</div>
                    <ul className="list-disc text-base text-gray-300 pl-8">{attributes}</ul>
                    <div className="flex flex-row items-center ">
                        <h2 className="flex-grow text-lg text-gray-400 text-bold">Forms</h2>
                        <button className="text-lg h-4 w-4 bg-gray-400 rounded-full" onClick={onClickAddForm}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </button>
                    </div>
                    {forms.map((form, i) => (
                        <Form key={i} propName={props.propName} form={form} interactionType={"property"} className="last:pb-4"></Form>
                    ))}
                </div>
            </details>
        </>
    )
}