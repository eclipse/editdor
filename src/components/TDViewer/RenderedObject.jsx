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
import React, { useCallback, useState } from 'react';
import "../../assets/main.css"
import { ChevronRight, ChevronDown } from 'react-feather';

function isObject(val) {
    if (val === null) { return false; }
    return ((typeof val === 'function') || (typeof val === 'object'));
}

export const RenderedObject = (map) => {
    const [showChildren, setShowChildren] = useState(new Array(Object.entries(map).length));
    const handleClick = useCallback((i) => {
        let temp = showChildren;
        let x = showChildren[i];
        temp[i] = x === null ? true : !x;
        setShowChildren([...temp]);
    }, [showChildren, setShowChildren])

    return (
        <>
            {Object.entries(map).map(([k, v], i) => {
                if (isObject(v)) {
                    let indicator = (<button className="flex align-top" onClick={() => handleClick(i)}>
                        <div className="flex text-white font-bold bg-gray-600 py-1 px-2 rounded-md align-middle">
                            <h4>{k}</h4>
                            {showChildren[i] === true ? <ChevronDown className="pl-1" /> : <ChevronRight className="pl-1" />}
                        </div>
                    </button>);

                    let children = (<div className="flex">
                        <div className="flex w-1 rounded-lg bg-gray-400 ml-2 my-1" />
                        <div className="pl-8 mt-1">
                            {showChildren[i] === true && (Object.entries(v) ?? []).map(([k1, v1], i1) => {
                                let m1 = {};
                                m1[k1] = v1;
                                return <RenderedObject {...m1} key={i1} />
                            })}
                        </div>
                    </div>);

                    return (
                        <div className="mb-1" key={i}>
                            {indicator}
                            {showChildren[i] === true && children}
                        </div>
                    )
                }

                return (
                    <div className="flex mb-1" key={i}>
                        <h4 className="text-white font-bold bg-gray-600 py-1 px-2 rounded-md">{k}</h4>
                        <div className="text-gray-400 px-2 py-1">{`${v}`}</div>
                    </div>
                )
            })}
        </ >
    );
}

