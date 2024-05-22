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
import React, { useContext, useEffect } from 'react';
import ediTDorContext from "../../context/ediTDorContext";
import GlobalState from '../../context/GlobalState';
import JSONEditorComponent from "../Editor/Editor";
import TDViewer from '../TDViewer/TDViewer';
import './App.css';
import AppFooter from './AppFooter';
import AppHeader from './AppHeader/AppHeader';

import { decompressSharedTd } from '../../share';

const GlobalStateWrapper = (props) => {
    return (
        <GlobalState>
            <App />
        </GlobalState>
    );
}

// The useEffect hook for checking the URI was called twice somehow.
// This variable prevents the callback from being executed twice.
let checkedUrl = false;
const App = (props) => {
    const context = useContext(ediTDorContext);

    useEffect(() => { dragElement(document.getElementById("separator"), "H"); }, [props])

    useEffect(() => {
        if (checkedUrl || (window.location.search.indexOf("td") <= -1 &&
            window.location.search.indexOf("localstorage") <= -1)) {
            return;
        }
        checkedUrl = true;

        const url = new URL(window.location.href);
        const compressedTd = url.searchParams.get("td");
        if (compressedTd !== null) {
            const td = decompressSharedTd(compressedTd);
            if (td === undefined) {
                alert("The lz compressed TD found in the URL couldn't be reconstructed.");
                return;
            };

            context.updateOfflineTD(JSON.stringify(td, null, 2));
        }

        if (url.searchParams.has("localstorage")) {
            let td = localStorage.getItem("td")
            if (td === undefined) {
                alert('Request to read TD from local storage failed.')
                return
            }
            td = JSON.parse(td)
            context.updateOfflineTD(JSON.stringify(td, null, 2));
        }
    }, [context]);

    return (
        <main className="h-full w-screen flex flex-col">
            <AppHeader></AppHeader>
            <div className="flex-grow splitter flex flex-row w-full height-adjust">
                <div className="w-7/12" id="second"><TDViewer /></div>
                <div id="separator"></div>
                <div className="w-5/12" id="first"><JSONEditorComponent /></div>
            </div>
            <AppFooter></AppFooter>
            <div id="modal-root"></div>
        </main>
    );
}


/**
 * 
 * @param {*} element 
 * @param {*} direction 
 * 
 * Adjust size of the two Panels "first" and "second"
 */
const dragElement = (element, direction) => {
    let md;
    const first = document.getElementById("first");
    const second = document.getElementById("second");

    const onMouseMove = (e) => {
        var delta = {
            x: md.e.clientX - e.clientX,
            y: e.clientY - md.e.clientY
        };

        if (direction === "H") {
            delta.x = Math.min(Math.max(delta.x, -md.firstWidth),
                md.secondWidth);

            element.style.left = md.offsetLeft + delta.x + "px";
            first.style.width = (md.firstWidth + delta.x) + "px";
            second.style.width = (md.secondWidth - delta.x) + "px";
        }
    }

    const onMouseDown = (e) => {
        md = {
            e,
            offsetLeft: element.offsetLeft,
            offsetTop: element.offsetTop,
            firstWidth: first.offsetWidth,
            secondWidth: second.offsetWidth
        };
        document.onmousemove = onMouseMove;
        document.onmouseup = () => {
            document.onmousemove = document.onmouseup = null;
        }
    }

    element.onmousedown = onMouseDown;
}

export default GlobalStateWrapper;