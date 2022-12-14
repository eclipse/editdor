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
import React, { useEffect } from 'react';
import './App.css';
import TDViewer from '../TDViewer/TDViewer'
import JSONEditorComponent from "../Editor/Editor";
import AppHeader from './AppHeader/AppHeader';
import AppFooter from './AppFooter';
import GlobalState from '../../context/GlobalState';

import '../../assets/main.css'

const App = (props) => {
    useEffect(() => { dragElement(document.getElementById("separator"), "H"); }, [props])
    return (
        <GlobalState>
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
        </GlobalState>
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
            x: e.clientX - md.e.clientX,
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

export default App;