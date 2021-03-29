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
import React from 'react';
import { ChevronDown } from 'react-feather';

export const DialogTextField = (props) => {
    return <div key={props.id} className="py-1">
        <label htmlFor={props.id} className="text-sm text-gray-400 font-medium pl-2">{props.label}:</label>
        <input
            name={props.id}
            id={props.id}
            className="border-gray-600 bg-gray-600 w-full p-2 sm:text-sm border-2 text-white rounded-md focus:outline-none focus:border-blue-500"
            placeholder={props.placeholder}
            type={props.type ?? "text"}
            autoFocus={props.autoFocus ?? false}
            onChange={props.onChange ? () => props.onChange() : null}
        />
        <span id={`${props.id}-helper-text`} className="text-xs text-red-400 pl-2"></span>
    </div>;
}

export const DialogTextArea = (props) => {
    return <>
        <label htmlFor={props.id} className="text-sm text-gray-400 font-medium pl-2">{props.label}:</label>
        <textarea
            id={props.id}
            rows="5"
            className="bg-gray-600
                sm:text-sm
                appearance-none 
                border-2 border-gray-600 rounded w-full 
                p-2
                text-white 
                leading-tight 
                focus:outline-none 
                focus:border-blue-500"
            placeholder={props.placeholder}
        />
    </>;
}

export const DialogDropdown = (props) => {
    return <>
        <label htmlFor={props.id} className="text-sm text-gray-400 font-medium pl-2">{props.label}:</label>
        <div className="relative">
            <select className="block appearance-none w-full bg-gray-600 border-2 border-gray-600 text-white py-3 px-4 pr-8 rounded leading-tight focus:border-blue-500 focus:outline-none" id={props.id}>
                {props.options.map((e) => { return <option key={e}>{e}</option> })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown color="#cacaca"></ChevronDown>
            </div>
        </div>
    </>;

}

export const DialogCheckbox = (props) => {
    return <div key={props.id} className="form-checkbox pl-2">
        {
            props.readOnly ?? true ?
                <input id={props.id}
                    className="form-checkbox-input"
                    type="checkbox"
                    value={props.label}
                /> :
                <input id={props.id}
                    className="form-checkbox-input"
                    type="checkbox"
                    value={props.label}
                    readOnly={props.readOnly}
                    checked={true}
                />
        }
        <label className="form-checkbox-label pl-2" htmlFor={props.id}>{props.label}</label>
    </div>;
}
