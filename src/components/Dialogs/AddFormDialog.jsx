/********************************************************************************
 * Copyright (c) 2018 - 2022 Contributors to the Eclipse Foundation
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
import { checkIfFormIsInItem, hasForms } from "../../util.js";
import { DialogTemplate } from "./DialogTemplate";
import {tdValidator} from "../../external/TdPlayground";

export const AddFormDialog = forwardRef((props, ref) => {
    const context = useContext(ediTDorContext);
    const [display, setDisplay] = React.useState(() => { return false });

    const type = props.type ?? "";
    const name = type && type[0].toUpperCase() + type.slice(1);
    const interaction = props.interaction ?? {};
    const interactionName = props.interactionName ?? "";

    useEffect(() => {
    }, [display, context]);

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

    const checkIfFormExists = (form) => {
        if (hasForms(interaction)) {
            return checkIfFormIsInItem(form, interaction)
        }
        return false
    }

    const addFormToInteraction = (form) => {
        switch (type) {
            case 'property':
                context.addForm({ propName: interactionName, form: form });
                break;
            case 'action':
                context.addActionForm({ actionName: interactionName, form: form });
                break;
            case 'event':
                context.addEventForm({ eventName: interactionName, form: form });
                break;
            case 'thing':
                let td = {}
                try {
                    td = JSON.parse(context.offlineTD);
                } catch (_) { }
                if (!hasForms(td)) {
                    td.forms = [];
                }
                td.forms.push(form);
                tdValidator(JSON.stringify(td, null, 2), console.log, {}).then(result => {
                    context.updateValidationMessage(result);
                    context.updateOfflineTD(JSON.stringify(td, null, 2));
                }, err => {
                    console.log("Error");
                    console.log(err);
                })
                break;
            default: { }
        }
    }

    const formSelection = operationsSelections(type);
    const children = <>
        <label className="text-sm text-gray-400 font-medium pl-3">Operations:</label>
        <div className="p-1">
            {formSelection}
        </div>
        <div className="p-1 pt-2">
            <label htmlFor="form-href" className="text-sm text-gray-400 font-medium pl-2">Href:</label>
            <input
                type="text"
                name="form-href"
                id="form-href"
                className="border-gray-600 bg-gray-600 w-full p-2 sm:text-sm border-2 text-white rounded-md focus:outline-none focus:border-blue-500"
                placeholder="http://example.com/href"
                onChange={() => { clearErrorMessage(); }}
            />
            <span id="form-href-info" className="text-xs text-red-400 pl-2"></span>
        </div>
    </>

    if (display) {
        return ReactDOM.createPortal(
            <DialogTemplate
                onCancel={close}
                onSubmit={() => {
                    let form = {};
                    form.op = operations(type).map(x => {
                        return document.getElementById('form-' + x).checked ? document.getElementById('form-' + x).value : undefined
                    }).filter(y => y !== undefined);

                    const href = document.getElementById("form-href").value;
                    form.href = href !== "" ? href.trim() : "/";

                    if (form.op.length === 0) {
                        showErrorMessage("You have to select at least one operation ...");
                    } else if (checkIfFormExists(form)) {
                        showErrorMessage("A Form for one of the selected operations already exists ...");
                    } else {
                        addFormToInteraction(form);
                        close();
                    }
                }}
                submitText={"Add"}
                children={children}
                title={`Add ${name} Form`}
                description={`Tell us how this ${name} can be interfaced by selecting operations below and providing an href.`}
            />,
            document.getElementById("modal-root"));
    }

    return null;
});

const showErrorMessage = (msg) => {
    document.getElementById("form-href-info").textContent = msg;
    document.getElementById("form-href").classList.remove("border-gray-600");
    document.getElementById("form-href").classList.add("border-red-400");
}

const clearErrorMessage = () => {
    document.getElementById("form-href").classList.add("border-gray-600");
    document.getElementById("form-href").classList.remove("border-red-400");
}

const operations = (type) => {
    switch (type) {
        case 'property': return [
            "writeproperty",
            "readproperty",
            "observeproperty",
            "unobserveproperty",
        ];
        case 'event': return [
            "subscribeevent",
            "unsubscribeevent",
        ];
        case 'action': return [
            "invokeaction"
        ];
        case 'thing': return [
            "writeallproperties",
            "readallproperties",
            "writemultipleproperties",
            "readmultipleproperties",
            "observeallproperties",
            "unobserveallproperties"
        ];
        default: return [];
    }
}

const operationsSelections = (type) => {
    return <div className="bg-gray-600 p-1 rounded-md">
        {operations(type).map((e) => formCheckbox(e))}
    </div>
};

const formCheckbox = (name) => {
    const id = `form-${name}`;

    return <div key={id} className="form-checkbox pl-2">
        {
            name !== "invokeaction" ? <input id={id}
                className="form-checkbox-input"
                type="checkbox"
                value={name}

            /> : <input id={id}
                className="form-checkbox-input"
                type="checkbox"
                value={name}
                readOnly={name === 'invokeaction'}
                checked={name === 'invokeaction'}
                />
        }
        <label className="form-checkbox-label pl-2" htmlFor={id}>{name}</label>
    </div>;
}
