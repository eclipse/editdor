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

export const ShareDialog = forwardRef((props, ref) => {
    const context = useContext(ediTDorContext);
    const [display, setDisplay] = React.useState(() => { return false });

    useEffect(() => {
        if (display === true) {
            copyLinkToClipboard(createPermalink(context.offlineTD));
            focusPermalinkField()
        }
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

    const urlField = createPermalinkField(context.offlineTD);

    if (display) {
        return ReactDOM.createPortal(
            <DialogTemplate
                onCancel={close}
                cancelText={"Close"}
                hasSubmit={false}
                children={urlField}
                title={"Share This TD"}
                description={"A link to this TD was copied to your clipboard."}
            />,
            document.getElementById("modal-root"));
    }

    return null;
});

const createPermalink = (td) => {
    let parsedTD = {};
    try {
        parsedTD = JSON.parse(td);
    } catch (_) { }

    return `${window.location.origin+window.location.pathname}?td=${encodeURIComponent(
        JSON.stringify(parsedTD)
    )}`;
}

const createPermalinkField = (td) => {
    return (<input
        type="text"
        name="share-td-field"
        id="share-td-field"
        className="border-gray-600 bg-gray-600 w-full p-2 sm:text-sm border-2 text-white rounded-md focus:outline-none focus:border-blue-500"
        defaultValue={createPermalink(td)}
    />);
};

const copyLinkToClipboard = (link) => {
    if (document.hasFocus()) {
        navigator.clipboard.writeText(link).then(
            function () {
                console.log("Async: Copied TD link to clipboard!");
            },
            function (err) {
                console.error("Async: Could not copy TD to clipboard: ", err);
            }
        );
    }
}

const focusPermalinkField = () => {
    setTimeout(() => {
        try {
            const textfield = document.getElementById("share-td-field");
            textfield.select();
        } catch (_) { }
    }, 250);
}