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
import React, { useContext } from 'react';
import '../../assets/main.css';
import ediTDorContext from '../../context/ediTDorContext';
import { buildAttributeListObject, separateForms } from '../../util';
import { AddFormDialog } from "../Dialogs/AddFormDialog";
import { AddLinkTdDialog } from '../Dialogs/AddLinkTdDialog';
import { InfoIconWrapper } from '../InfoIcon/InfoIcon';
import { getFormsTooltipContent } from '../InfoIcon/InfoTooltips';
import { getLinksTooltipContent } from '../InfoIcon/InfoTooltips';
import Form from './Form';
import Link from './Link';
import { InteractionSection } from './InteractionSection';
import { RenderedObject } from './RenderedObject';
let tdJSON = {};
let oldtdJSON = {};
let error = "";

export default function TDViewer() {
    const context = useContext(ediTDorContext);

    const addFormDialog = React.useRef();
    const openAddFormDialog = () => { addFormDialog.current.openModal() }

    const addLinkDialog = React.useRef();
    const openAddLinkDialog = () => { addLinkDialog.current.openModal() }

    try {
        oldtdJSON = tdJSON;
        tdJSON = JSON.parse(context.offlineTD);
        error = '';
    } catch (e) {
        error = e.message;
        tdJSON = oldtdJSON;
    }

    if (!Object.keys(tdJSON).length) {
        return (
            <div className="flex h-full w-full bg-gray-500 justify-center align-center text-center ">
                <div className="text-4xl text-white place-self-center">Start writing a new TD by clicking "New TD"</div>
            </div>
        )
    }

    let forms;
    let links;
    let metaData;

    if (tdJSON) {
        if (tdJSON.forms) {
            const formsSeparated = separateForms(tdJSON.forms);
            forms = formsSeparated.map((key, index) => {
                return (<Form form={key} propName={index} key={index} />);
            });
        }
        if (tdJSON.links) {
            const linksfromTd=tdJSON.links;
            links = linksfromTd.map((key, index) => {
                return (<Link link={key} propName={index} key={index} />);
            });
        }

        metaData = tdJSON;

        const alreadyRenderedKeys = ["id", "properties", "actions", "events", "forms", "description", "title","links"];
        const attributeListObject = buildAttributeListObject(tdJSON.id ? { id: tdJSON.id } : {}, tdJSON, alreadyRenderedKeys);

        return (
            <div className="h-full w-full bg-gray-500 p-8 overflow-auto">
                {(error.length > 0 && (
                    <div className="flex h-10 w-full bg-formRed rounded-md px-4 mt-2 bg-opacity-75 border-2 border-formRed">
                        <div className="flex h-6 w-16 bg-white rounded-md place-self-center justify-center">
                            <div className="text-formRed place-self-center text-center text-xs px-4">Error</div>
                        </div>
                        <div className=" place-self-center pl-3 text-base text-white overflow-hidden">{error}</div>
                    </div>))}
                {(metaData !== undefined && Object.keys(metaData).length > 0) && (
                    <div>
                        <div className="text-3xl text-white">{metaData.title}</div>
                        <RenderedObject {...attributeListObject}></RenderedObject>
                        {
                            metaData.description ? <div className="text-xl text-white pt-4">{metaData.description}</div> : <></>
                        }
                    </div>)
                }
                <details className="pt-8">
                    <summary className="flex justify-start items-center cursor-pointer">
                        <div className="flex flex-grow">
                            <InfoIconWrapper tooltip={getFormsTooltipContent()}>
                                <h2 className="text-2xl text-white p-1 flex-grow">Forms</h2>
                            </InfoIconWrapper>
                        </div>
                        <button className="text-white font-bold text-sm bg-blue-500 cursor-pointer rounded-md p-2" onClick={openAddFormDialog}>Add Top Level Form</button>
                        <AddFormDialog type="thing"
                            interaction={tdJSON}
                            ref={addFormDialog}
                        />
                    </summary>
                    {forms && <div className="pt-4"><div className="rounded-lg bg-gray-600 px-6 pt-4 pb-4">{forms}</div></div>}
                </details>

                <details className="pt-8">
                    <summary className="flex justify-start items-center cursor-pointer">
                        <div className="flex flex-grow">
                            <InfoIconWrapper tooltip={getLinksTooltipContent()}>
                                <h2 className="text-2xl text-white p-1 flex-grow">Links</h2>
                            </InfoIconWrapper>
                        </div>
                        <button className="text-white font-bold text-sm bg-blue-500 cursor-pointer rounded-md p-2" onClick={openAddLinkDialog}>Add top level Link</button>
                        <AddLinkTdDialog type="link"
                            interaction={tdJSON}
                            ref={addLinkDialog}
                        />
                    </summary>
                    {links && <div className="pt-4"><div className="rounded-lg bg-gray-600 px-6 pt-4 pb-4">{links}</div></div>}
                </details>

                <InteractionSection interaction="Properties" ></InteractionSection>
                <InteractionSection interaction="Actions" ></InteractionSection>
                <InteractionSection interaction="Events" ></InteractionSection>
            </div >
        );
    }
}
