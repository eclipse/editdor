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
import React, { forwardRef, useContext, useEffect, useImperativeHandle } from 'react';
import ReactDOM from "react-dom";
import ediTDorContext from "../../context/ediTDorContext";
import { DialogTemplate } from "./DialogTemplate";

export const ConvertTmDialog = forwardRef((props, ref) => {
    const context = useContext(ediTDorContext);
    const [htmlInputs, setHtmlInputs] = React.useState([]);
    const [display, setDisplay] = React.useState(() => { return false });

    useEffect(() => {
        setHtmlInputs(createHtmlInputs(context.offlineTD));
    }, [context]);

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

    if (display) {
        return ReactDOM.createPortal(
            <DialogTemplate
                onCancel={close}
                onSubmit={() => convertTmToTd(context.offlineTD, htmlInputs)}
                submitText={"Generate TD"}
                children={htmlInputs}
                title={"Generate TD From TM"}
                description={"Please provide values to switch the placeholders with."}
            />,
            document.getElementById("modal-root"));
    }

    return null;
});


const createHtmlInputs = (td) => {
    try {
        let regex = /{{/gi,
            result,
            startIindices = [];
        while ((result = regex.exec(td))) {
            startIindices.push(result.index);
        }
        regex = /}}/gi;
        let endIndices = [];
        while ((result = regex.exec(td))) {
            endIndices.push(result.index);
        }
        let placeholders = [];
        for (let i = 0; i < startIindices.length; i++) {
            placeholders.push(td.slice(startIindices[i] + 2, endIndices[i]));
        }
        placeholders = [...new Set(placeholders)];
        const htmlInputs = placeholders.map((holder) => {
            return (
                <div key={holder} className="py-1">
                    <label htmlFor={holder} className="text-sm text-gray-400 font-medium pl-2">{holder}:</label>
                    <input
                        type="text"
                        name={holder}
                        id={holder}
                        className="border-gray-600 bg-gray-600 w-full p-2 sm:text-sm border-2 text-white rounded-md focus:outline-none focus:border-blue-500"
                        placeholder="Enter a value..."
                    />
                </div>
            );
        });
        return htmlInputs;
    } catch (e) {
        console.log(e);
        return [];
    }
};

const convertTmToTd = (td, htmlInputs) => {
    let mappingObject = {}
    htmlInputs.forEach((y) => {
        const elem = document.getElementById(y.key)
        mappingObject[y.key] = elem.value
        return elem.value
    });
    Object.keys(mappingObject).forEach(key => {
        td = td.split(`{{${key}}}`).join(mappingObject[key])
    })
    const parse = JSON.parse(td);
    const permalink = `${window.location.href}?td=${encodeURI(JSON.stringify(parse))}`
    window.open(permalink, "_blank");
}
