/********************************************************************************
 * Copyright (c) 2018 - 2025 Contributors to the Eclipse Foundation
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
import ReactDOM from "react-dom";

export const SpinnerTemplate = _ => {

    return ReactDOM.createPortal(
        <div
            className="flex bg-transparent-400 w-full h-full absolute top-0 left-0 justify-center items-center z-10 text-white">
            <div className="bg-transparent-400 w-1/3 flex flex-col justify-center items-center p-4 max-h-screen">

                <div className="justify-center overflow-hidden p-2">
                    {showSpinner()}
                </div>

            </div>
        </div>,
        document.getElementById("modal-root")
    );

};

const showSpinner = _ => {
    return (<div className="spinner-container">
        <div className="loading-spinner">
        </div>
    </div>);
}