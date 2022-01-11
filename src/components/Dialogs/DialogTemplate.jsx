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

export const DialogTemplate = (props) => {
    const title = props.title ?? "Default Title";
    const description = props.description ?? "Default description, please override.";
    const children = props.children ?? <></>;

    const cancelText = props.cancelText ?? "Cancel";
    const onCancel = props.onCancel ?? (() => { });

    const submitText = props.submitText ?? "Submit";
    const onSubmit = props.onSubmit ?? (() => { });
    const hasSubmit=props.hasSubmit ?? true
    let keysDown = {};
    window.onkeydown = function (e) {
        keysDown[e.key] = true;
        if (keysDown["Control"] && keysDown["Enter"]) {
            document.getElementById("submitButton").click();
        }
    }

    window.onkeyup = function (e) {
        keysDown[e.key] = false;
    }

    return (<div className="flex bg-gray-400 bg-opacity-50 w-full h-full absolute top-0 left-0 justify-center items-center z-10 text-white">
        <div className="bg-gray-500 w-1/3 flex flex-col justify-start rounded-xl shadow-xl p-4 max-h-screen">
            <div className="flex flex-row justify-start items-center  ">
                <h1 className="text-xl font-bold flex-grow pl-2">{title}</h1>
            </div>
            <h2 className="text-gray-400 py-2 pl-2">{description}</h2>
            <div className="overflow-auto p-2">
                {children}
            </div>
            <div className="flex justify-end pt-4 p-2">
                <button className="text-white bg-gray-500 p-2 mr-1 rounded-md" onClick={() => { onCancel(); }}>{cancelText}</button>
                {hasSubmit&& <button id="submitButton" className="flex text-white bg-blue-500 p-2 rounded-md" onClick={() => onSubmit()}>{submitText}</button>}
            </div>
        </div>
    </div>);
};

