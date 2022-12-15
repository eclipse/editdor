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
import { DialogCheckbox, DialogDropdown, DialogTextArea, DialogTextField } from './DialogComponents';
import { DialogTemplate } from "./DialogTemplate";
import {tdValidator} from "../../external/TdPlayground";

const NO_TYPE = "undefined";

export const AddPropertyDialog = forwardRef((_, ref) => {
    const context = useContext(ediTDorContext);
    const [display, setDisplay] = React.useState(() => { return false });

    const type = "property";
    const key = "properties";
    const name = type && type[0].toUpperCase() + type.slice(1);

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

    const children = <>
        <DialogTextField
            id={`${type}-title`}
            label="Title"
            placeholder={`${name} Title`}
            autoFocus={true}
            onChange={() => clearErrorMessage()}
        />
        <DialogTextArea
            id={`${type}-description`}
            label="Description"
            placeholder={`A short description about the new ${name}...`}
        />
        <DialogDropdown
            id={`${type}-type`}
            label="Type"
            options={[NO_TYPE, "number", "integer", "boolean", "string", "object", "array",]}
        />
        <div className="h-2"></div>
        <label className="text-sm text-gray-400 font-medium pl-3">Additional:</label>
        <div id="additional" className="bg-gray-600 p-1 rounded-md">
            <DialogCheckbox
                id={`${type}-readOnly`}
                label="Read Only"
            />
            <DialogCheckbox
                id={`${type}-observable`}
                label="Observable"
            />
        </div>
    </>;

    const onAddProperty = () => {
        let property = {};
        property.title = document.getElementById(`${type}-title`).value;
        property.observable = document.getElementById(`${type}-observable`).checked;
        property.readOnly = document.getElementById(`${type}-readOnly`).checked;

        const description = document.getElementById(`${type}-description`).value;
        if (description !== "") {
            property.description = description;
        }

        const dataType = document.getElementById(`${type}-type`).value;
        if (dataType !== NO_TYPE) {
            property.type = dataType;
        }
        if (dataType === "array") {
            property.items = {};
        }
        else if (dataType === "object") {
            property.properties = {};
        }

        property.forms = [];

        let td = JSON.parse(context.offlineTD);
        if (td[key] && td[key][property.title]) {
            showErrorMessage(`A ${name} with this title already exists...`);
        } else {
            addPropertyToTd(property);
            close();
        }
    }

    const addPropertyToTd = (property) => {
        let td = JSON.parse(context.offlineTD);

        if (!td[key]) {
            td[key] = {};
        }
        td[key][property.title] = property;
        tdValidator(JSON.stringify(td, null, 2), console.log, {}).then(result => {
            context.updateValidationMessage(result);
            context.updateOfflineTD(JSON.stringify(td, null, 2));
        }, err => {
            console.log("Error");
            console.log(err);
        })
        return;
    }

    const showErrorMessage = (msg) => {
        document.getElementById(`${type}-title-helper-text`).textContent = msg;
        document.getElementById(`${type}-title`).classList.remove("border-gray-600");
        document.getElementById(`${type}-title`).classList.add("border-red-400");
    }

    const clearErrorMessage = () => {
        document.getElementById(`${type}-title-helper-text`).textContent = "";
        document.getElementById(`${type}-title`).classList.add("border-gray-600");
        document.getElementById(`${type}-title`).classList.remove("border-red-400");
    }

    if (display) {
        return ReactDOM.createPortal(
            <DialogTemplate
                onCancel={close}
                onSubmit={() => {
                    onAddProperty();
                }}
                submitText={`Add ${name}`}
                children={children}
                title={`Add New ${name}`}
                description={`Tell us a little something about the ${name} you want to add.`}
            />,
            document.getElementById("modal-root"));
    }

    return null;
});

