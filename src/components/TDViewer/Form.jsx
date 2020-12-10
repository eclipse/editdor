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

export default function Form(props) {

    const formChooser = {
        "observeproperty": <ObserveForm type="properties" form={props.form} propName={props.propName} />,
        "unobserveproperty": <UnobserveForm type="properties" form={props.form} propName={props.propName}/>,
        "readproperty": <ReadForm type="properties" form={props.form} propName={props.propName}/>,
        "readmultipleproperties": <ReadMultipleForm type="properties" form={props.form} propName={props.propName}/>,
        "readallproperties": <ReadAllForm type="properties" form={props.form} propName={props.propName}/>,
        "writeproperty": <WriteForm type="properties" form={props.form} propName={props.propName}/>,
        "writemultipleproperties": <WriteMultipleForm type="properties" form={props.form} propName={props.propName}/>,
        "writeallproperties": <WriteAllForm type="properties" form={props.form} propName={props.propName}/>,
        "invokeaction": <InvokeForm type="actions" form={props.form} propName={props.propName}/>,
        "unsubscribeevent": <UnobserveForm type="events" form={props.form} propName={props.propName}/>,
    }

    if (formChooser[props.form.op]) {
        return formChooser[props.form.op];
    }

    if (props.interactionType === "action") {
        return <InvokeForm type="actions" form={props.form} propName={props.propName}/>
    } else if (props.interactionType === "event") {
        return <ObserveForm type="events" form={props.form} propName={props.propName}/>
    }

    return <UndefinedForm form={props.form} propName={props.propName}/>
}



export function ObserveForm(props) {
    const context = useContext(ediTDorContext)
    const deleteForm = (e) => {
        context.removeForm(e)
    }
    return (
        <div className="flex flex-row items-center justify-start h-10 w-full bg-formOrange rounded-md px-4 mt-2 bg-opacity-75 border-2 border-formOrange">
            <div className="flex h-6 w-16 bg-white rounded-md place-self-center justify-center">
                <div className="text-formOrange place-self-center text-center text-xs px-4">Observe</div>
            </div>
            <div className="place-self-center pl-3 text-base text-white overflow-hidden flex-grow">{props.form.href}</div>
            <button className="text-base w-6 h-6 p-1 m-1 shadow-md rounded-full bg-formOrange" onClick={() => deleteForm(props)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
}

export function UnobserveForm(props) {
    const context = useContext(ediTDorContext)
    const deleteForm = (e) => {
        context.removeForm(e)
    }
    return (
        <div className="flex flex-row items-center justify-start h-10 w-full bg-formRed rounded-md px-4 mt-2 bg-opacity-75 border-2 border-formRed">
            <div className="flex h-6 w-16 bg-white rounded-md place-self-center justify-center">
                <div className="text-formRed place-self-center text-center text-xs px-4">Unobserve</div>
            </div>
            <div className=" place-self-center pl-3 text-base text-white overflow-hidden flex-grow">{props.form.href}</div>
            <button className="text-base w-6 h-6 p-1 m-1 shadow-md rounded-full bg-formRed" onClick={() => deleteForm(props)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
}

export function ReadForm(props) {
    const context = useContext(ediTDorContext)
    const deleteForm = (e) => {
        context.removeForm(e)
    }
    return (
        <div className="flex flex-row items-center justify-start h-10 w-full bg-formGreen rounded-md px-4 mt-2 bg-opacity-75 border-2 border-formGreen">
            <div className="flex h-6 w-16 bg-white rounded-md place-self-center justify-center">
                <div className="text-formGreen place-self-center text-center text-xs px-4">Read</div>
            </div>
            <div className=" place-self-center pl-3 text-base text-white overflow-hidden flex-grow">{props.form.href}</div>
            <button className="text-base w-6 h-6 p-1 m-1 shadow-md rounded-full bg-formGreen" onClick={() => deleteForm(props)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
}

export function ReadMultipleForm(props) {
    const context = useContext(ediTDorContext)
    const deleteForm = (e) => {
        context.removeForm(e)
    }
    return (
        <div className="flex flex-row items-center justify-start h-10 w-full bg-formGreen rounded-md px-4 mt-2 bg-opacity-75 border-2 border-formGreen">
            <div className="flex h-6 w-16 bg-white rounded-md place-self-center justify-center">
                <div className="text-formGreen place-self-center text-center text-xs px-4">ReadMultiple</div>
            </div>
            <div className=" place-self-center pl-3 text-base text-white overflow-hidden flex-grow">{props.form.href}</div>
            <button className="text-base w-6 h-6 p-1 m-1 shadow-md rounded-full bg-formGreen" onClick={() => deleteForm(props)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
}

export function ReadAllForm(props) {
    const context = useContext(ediTDorContext)
    const deleteForm = (e) => {
        context.removeForm(e)
    }
    return (
        <div className="flex flex-row items-center justify-start h-10 w-full bg-formGreen rounded-md px-4 mt-2 bg-opacity-75 border-2 border-formGreen">
            <div className="flex h-6 w-16 bg-white rounded-md place-self-center justify-center">
                <div className="text-formGreen place-self-center text-center text-xs px-4">ReadAll</div>
            </div>
            <div className=" place-self-center pl-3 text-base text-white overflow-hidden flex-grow">{props.form.href}</div>
            <button className="text-base w-6 h-6 p-1 m-1 shadow-md rounded-full bg-formGreen" onClick={() => deleteForm(props)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
}

export function WriteForm(props) {
    const context = useContext(ediTDorContext)
    const deleteForm = (e) => {
        context.removeForm(e)
    }
    return (
        <div className="flex flex-row items-center justify-start h-10 w-full bg-formBlue rounded-md px-4 mt-2 bg-opacity-75 border-2 border-formBlue">
            <div className="flex h-6 w-16 bg-white rounded-md place-self-center justify-center">
                <div className="text-formBlue place-self-center text-center text-xs px-4">Write</div>
            </div>
            <div className=" place-self-center pl-3 text-base text-white overflow-hidden flex-grow">{props.form.href}</div>
            <button className="text-base w-6 h-6 p-1 m-1 shadow-md rounded-full bg-formBlue" onClick={() => deleteForm(props)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
}

export function WriteMultipleForm(props) {
    const context = useContext(ediTDorContext)
    const deleteForm = (e) => {
        context.removeForm(e)
    }
    return (
        <div className="flex flex-row items-center justify-start h-10 w-full bg-formBlue rounded-md px-4 mt-2 bg-opacity-75 border-2 border-formBlue">
            <div className="flex h-6 w-16 bg-white rounded-md place-self-center justify-center">
                <div className="text-formBlue place-self-center text-center text-xs px-4">WriteMultiple</div>
            </div>
            <div className=" place-self-center pl-3 text-base text-white overflow-hidden flex-grow">{props.form.href}</div>
            <button className="text-base w-6 h-6 p-1 m-1 shadow-md rounded-full bg-formBlue" onClick={() => deleteForm(props)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
}

export function WriteAllForm(props) {
    const context = useContext(ediTDorContext)
    const deleteForm = (e) => {
        context.removeForm(e)
    }
    return (
        <div className="flex flex-row items-center justify-start h-10 w-full bg-formBlue rounded-md px-4 mt-2 bg-opacity-75 border-2 border-formBlue">
            <div className="flex h-6 w-16 bg-white rounded-md place-self-center justify-center">
                <div className="text-formBlue place-self-center text-center text-xs px-4">WriteAll</div>
            </div>
            <div className=" place-self-center pl-3 text-base text-white overflow-hidden flex-grow">{props.form.href}</div>
            <button className="text-base w-6 h-6 p-1 m-1 shadow-md rounded-full bg-formBlue" onClick={() => deleteForm(props)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
}

export function InvokeForm(props) {
    const context = useContext(ediTDorContext)
    const deleteForm = (e) => {
        context.removeForm(e)
    }
    return (
        <div className="flex flex-row items-center justify-start h-10 w-full bg-formRed rounded-md px-4 mt-2 bg-opacity-75 border-2 border-formRed">
            <div className="flex h-6 w-16 bg-white rounded-md place-self-center justify-center">
                <div className="text-formRed place-self-center text-center text-xs px-4">Invoke</div>
            </div>
            <div className=" place-self-center pl-3 text-base text-white overflow-hidden flex-grow">{props.form.href}</div>
            <button className="text-base w-6 h-6 p-1 m-1 shadow-md rounded-full bg-formRed" onClick={() => deleteForm(props)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
}

export function UndefinedForm(props) {
    const context = useContext(ediTDorContext)
    const deleteForm = (e) => {
        context.removeForm(e)
    }
    return (
        <div className="flex flex-row items-center justify-start h-10 w-full bg-gray-300 rounded-md px-4 mt-2 bg-opacity-75 border-2 border-gray-300">
            <div className="flex h-6 w-16 bg-white rounded-md place-self-center justify-center">
                <div className="place-self-center text-center text-xs px-4">Undefined</div>
            </div>
            <div className=" place-self-center pl-3 text-base overflow-hidden flex-grow">{props.form.href}</div>
            <button className="text-base w-6 h-6 p-1 m-1 shadow-md rounded-full bg-white" onClick={() => deleteForm(props)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
}