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
import React from "react";
import "../../assets/main.css"

export default function Form(props) {
    const formChooser = {
        "observeproperty": <ObserveForm form={props.form} />,
        "unobserveproperty": <UnobserveForm form={props.form} />,
        "readproperty": <ReadForm form={props.form} />,
        "writeproperty": <WriteForm form={props.form} />,
        "invokeaction": <InvokeForm form={props.form} />,
    }

    if (formChooser[props.form.op]) {
        return formChooser[props.form.op];
    }

    if (props.interactionType === "action") {
        return <InvokeForm form={props.form} />
    } else if (props.interactionType === "event") {
        return <ObserveForm form={props.form} />
    }

    return <UndefinedForm form={props.form} />
}

export function ObserveForm(props) {
    return (
        <div className="flex h-10 w-full bg-formOrange rounded-md px-4 mt-2 bg-opacity-75 border-2 border-formOrange">
            <div className="flex h-6 w-16 bg-white rounded-md place-self-center justify-center">
                <div className="text-formOrange place-self-center text-center text-xs px-4">Observe</div>
            </div>
            <div className="place-self-center pl-3 text-base text-white overflow-hidden">{props.form.href}</div>
        </div>
    );
}

export function UnobserveForm(props) {
    return (
        <div className="flex h-10 w-full bg-formRed rounded-md px-4 mt-2 bg-opacity-75 border-2 border-formRed">
            <div className="flex h-6 w-16 bg-white rounded-md place-self-center justify-center">
                <div className="text-formRed place-self-center text-center text-xs px-4">Unobserve</div>
            </div>
            <div className=" place-self-center pl-3 text-base text-white overflow-hidden">{props.form.href}</div>
        </div>
    );
}

export function ReadForm(props) {
    return (
        <div className="flex h-10 w-full bg-formGreen rounded-md px-4 mt-2 bg-opacity-75 border-2 border-formGreen">
            <div className="flex h-6 w-16 bg-white rounded-md place-self-center justify-center">
                <div className="text-formGreen place-self-center text-center text-xs px-4">Read</div>
            </div>
            <div className=" place-self-center pl-3 text-base text-white overflow-hidden">{props.form.href}</div>
        </div>
    );
}

export function WriteForm(props) {
    return (
        <div className="flex h-10 w-full bg-formBlue rounded-md px-4 mt-2 bg-opacity-75 border-2 border-formBlue">
            <div className="flex h-6 w-16 bg-white rounded-md place-self-center justify-center">
                <div className="text-formBlue place-self-center text-center text-xs px-4">Write</div>
            </div>
            <div className=" place-self-center pl-3 text-base text-white overflow-hidden">{props.form.href}</div>
        </div>
    );
}

export function InvokeForm(props) {
    return (
        <div className="flex h-10 w-full bg-formRed rounded-md px-4 mt-2 bg-opacity-75 border-2 border-formRed">
            <div className="flex h-6 w-16 bg-white rounded-md place-self-center justify-center">
                <div className="text-formRed place-self-center text-center text-xs px-4">Invoke</div>
            </div>
            <div className=" place-self-center pl-3 text-base text-white overflow-hidden">{props.form.href}</div>
        </div>
    );
}

export function UndefinedForm(props) {
    return (
        <div className="flex h-10 w-full bg-gray-300 rounded-md px-4 mt-2 bg-opacity-75 border-2 border-gray-300">
            <div className="flex h-6 w-16 bg-white rounded-md place-self-center justify-center">
                <div className="place-self-center text-center text-xs px-4">Undefined</div>
            </div>
            <div className=" place-self-center pl-3 text-base overflow-hidden">{props.form.href}</div>
        </div>
    );
}