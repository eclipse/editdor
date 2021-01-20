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
import React from 'react';
import { Info } from 'react-feather';
import ReactTooltip from 'react-tooltip';

/**
 * Display an info icon that shows a information text when hovered
 * next to the child.
 *
 * The parameter tooltip a TooltipContent object containing HTML on how
 * the tooltip is rendered and a link that gets called onClick.
 * @param {TooltipContent} tooltip
 * @param {Object} children
 */
export const InfoIconWrapper = (props) => {
    return (
        <div className="flex flex-row items-center">
            <div className="pr-0.5">
                {props.children}
            </div>
            <button onClick={() => window.open(props.tooltip.href, "_blank")}>
                <InfoIcon html={props.tooltip.html} />
            </button>
            <div className="p-1"></div>
        </div >
    );
}

/**
 * Display an info icon that shows a information text when hovered.
 * 
 * The parameter html is a String containing HTML for the tooltips layout.
 * @param {String} html
 */
export const InfoIcon = (props) => {
    return (
        <>
            <Info color="grey"
                size="16"
                data-html={true}
                data-type="info"
                data-tip={props.html}
                data-background-color="#2c2c2e"
            />
            <ReactTooltip html={true} type="info" />
        </ >
    );
}