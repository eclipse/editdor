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
import { DialogTextArea, DialogTextField } from './DialogComponents';
import { DialogTemplate } from "./DialogTemplate";
import {tdValidator} from "../../external/TdPlayground";

export const AddActionDialog = forwardRef((_, ref) => {
    const context = useContext(ediTDorContext);
    const [display, setDisplay] = React.useState(() => { return false });

    const type = "action";
    const key = "actions";
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
    </>;

    const onAddAction = () => {
        let action = {};
        action.title = document.getElementById(`${type}-title`).value;

        const description = document.getElementById(`${type}-description`).value;
        if (description !== "") {
            action.description = description;
        }
        action.forms = [];

        let td = JSON.parse(context.offlineTD);
        if (td[key] && td[key][action.title]) {
            showErrorMessage(`An ${name} with this title already exists...`);
        } else {
            addActionToTd(action);
            close();
        }
    }

    const addActionToTd = (action) => {
        let td = JSON.parse(context.offlineTD);

        if (!td[key]) {
            td[key] = {};
        }

        td[key][action.title] = action;

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
                    onAddAction();
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

