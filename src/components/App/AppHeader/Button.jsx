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
import React from 'react';

export default function Button(props) {
    return (
        <button
            onClick={props.onClick}
            className="
                flex
                bg-blue-400                 
                hover:bg-blue-300 
                text-white 
                font-bold 
                py-2 px-5 
                rounded 
                h-12
                text-center 
                cursor-pointer
                justify-center
            ">
            <div className="place-self-center">
                {props.children}
            </div>
        </button>
    );
}