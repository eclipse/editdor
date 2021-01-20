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
import React from "react";
import { Search } from "react-feather";

export const SearchBar = (props) => {
    return (
        <div className="relative text-gray-600">
            <input type="search"
                autoComplete="on"
                className="caret-gray bg-gray-600 text-white px-5 pr-10 place-self-center rounded-lg text-sm focus:outline-none h-9"
                onKeyUp={props.onKeyUp}
                placeholder={props.placeholder}
                aria-label={props.ariaLabel}
            />
            <div disabled type="submit" className="cursor-default absolute right-0 top-0 mt-1 mr-4">
                <Search color="#2c2c2e"></Search>
            </div>
        </div>
    );
}