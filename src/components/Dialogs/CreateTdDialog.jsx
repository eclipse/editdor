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
import React, { forwardRef, useImperativeHandle, useContext } from 'react';
import ReactDOM from "react-dom";
import { DialogTemplate } from "./DialogTemplate";
import ediTDorContext from '../../context/ediTDorContext';
import { ChevronDown } from 'react-feather';

export const CreateTdDialog = forwardRef((props, ref) => {
    const context = useContext(ediTDorContext);
    const [display, setDisplay] = React.useState(() => { return false });

    useImperativeHandle(ref, () => {
        return {
            openModal: () => open(),
            close: () => close()
        }
    });

    const open = () => {
        setDisplay(true)
    };

    const close = () => {
        setDisplay(false);
    };

    const content = buildForm();

    if (display) {
        return ReactDOM.createPortal(
            <DialogTemplate
                onCancel={close}
                onSubmit={() => {
                    console.log("submit clicked");
                    context.updateOfflineTD(JSON.stringify(createNewTD(), null, "\t"), "AppHeader");
                    close();
                }}
                children={content}
                submitText={"Create TD"}
                title={"Create a New TD"}
                description={"To quickly create a basis for your new TD just fill out this little template and we'll get you going."}
            />,
            document.getElementById("modal-root"));
    }

    return null;
});


const buildForm = () => {
    return <>
        {formField("ID", "urn:thing-id", "thing-id", "url", "autoFocus")}
        {formField("Title", "Thing Title", "thing-title", "text")}
        {formField("Base", "http://www.example.com/thing-path", "thing-base", "url")}
        <label htmlFor="thing-description" className="text-sm text-gray-400 font-medium pl-2">Description:</label>
        <textarea id="thing-description" rows="5"
            className="bg-gray-600
                sm:text-sm
                appearance-none 
                border-2 border-gray-600 rounded w-full 
                p-2
                text-white 
                leading-tight 
                focus:outline-none 
                focus:border-blue-500"
            placeholder="A short description of what the Thing does..." />
        <label htmlFor="thing-security" className="text-sm text-gray-400 font-medium pl-2">Security:</label>
        <div className="relative">
            <select className="block appearance-none w-full bg-gray-600 border-2 border-gray-600 text-white py-3 px-4 pr-8 rounded leading-tight focus:border-blue-500 focus:outline-none" id="thing-security">
                <option>nosec</option>
                <option>basic</option>
                <option>digest</option>
                <option>bearer</option>
                <option>psk</option>
                <option>oauth2</option>
                <option>apikey</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown color="#cacaca"></ChevronDown>
            </div>
        </div>
    </>;
}

const formField = (label, placeholder, id, type, autoFocus) => {
    return <div key={id} className="py-1">
        <label htmlFor={id} className="text-sm text-gray-400 font-medium pl-2">{label}:</label>
        <input
            name={id}
            id={id}
            className="border-gray-600 bg-gray-600 w-full p-2 sm:text-sm border-2 text-white rounded-md focus:outline-none focus:border-blue-500"
            placeholder={placeholder}
            type={type}
            autoFocus={autoFocus === 'autoFocus'}
        />
    </div>;
}

const createNewTD = () => {
    let id = document.getElementById('thing-id').value;
    let title = document.getElementById('thing-title').value;
    let base = document.getElementById('thing-base').value;

    let tdMetadata = { id: id, title: title, base: base }

    let tdDescription = document.getElementById('thing-description').value;
    let tdSecurity = document.getElementById('thing-security').value;

    var thing = {};

    thing["@context"] = "https://www.w3.org/2019/wot/td/v1";
    thing["title"] = tdMetadata.title !== "" ? tdMetadata.title : "ediTDor Thing";
    thing["id"] = tdMetadata.id !== "" ? tdMetadata.id : "urn:editdor-thing-id";

    if (tdMetadata.base !== "") {
        thing["base"] = tdMetadata.base !== "" ? tdMetadata.base : "/";
    }

    if (tdDescription !== "") {
        thing["description"] = tdDescription;
    }

    let securityDefinitions = {};
    securityDefinitions[`${tdSecurity}_sc`] = { scheme: tdSecurity };

    thing["securityDefinitions"] = securityDefinitions;
    thing["security"] = `${tdSecurity}_sc`;

    thing["properties"] = {};
    thing["actions"] = {};
    thing["events"] = {};

    return thing;
}