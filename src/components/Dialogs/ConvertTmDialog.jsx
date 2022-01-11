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

export const ConvertTmDialog = forwardRef((props, ref) => {
    const context = useContext(ediTDorContext);
    const [htmlInputs, setHtmlInputs] = React.useState([]);
    const [display, setDisplay] = React.useState(() => { return false });

    useEffect(() => {
        setHtmlInputs(createHtmlInputs(context.offlineTD));
    }, [context]);

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

    if (display) {
        return ReactDOM.createPortal(
            <DialogTemplate
                onCancel={close}
                onSubmit={() => convertTmToTd(context.offlineTD, htmlInputs)}
                submitText={"Generate TD"}
                children={htmlInputs}
                title={"Generate TD From TM"}
                description={"Please provide values to switch the placeholders with."}
            />,
            document.getElementById("modal-root"));
    }

    return null;
});


const createHtmlInputs = (td) => {
    try {
        let regex = /{{/gi,
            result,
            startIindices = [];
        while ((result = regex.exec(td))) {
            startIindices.push(result.index);
        }
        regex = /}}/gi;
        let endIndices = [];
        while ((result = regex.exec(td))) {
            endIndices.push(result.index);
        }
        let placeholders = [];
        for (let i = 0; i < startIindices.length; i++) {
            placeholders.push(td.slice(startIindices[i] + 2, endIndices[i]));
        }
        placeholders = [...new Set(placeholders)];
        const htmlInputs = placeholders.map((holder) => {
            return (
                <div key={holder} className="py-1">
                    <label htmlFor={holder} className="text-sm text-gray-400 font-medium pl-2">{holder}:</label>
                    <input
                        type="text"
                        name={holder}
                        id={holder}
                        className="border-gray-600 bg-gray-600 w-full p-2 sm:text-sm border-2 text-white rounded-md focus:outline-none focus:border-blue-500"
                        placeholder="Enter a value..."
                    />
                </div>
            );
        });

        // Containers for created html elements (checkboxes) of each interaction affordance
        let htmlProperties = [];
        let htmlActions = [];
        let htmlEvents = [];

        try {
            const parsed = JSON.parse(td);
            const properties = Object.keys(parsed["properties"] ? parsed["properties"] : {});
            const actions = Object.keys(parsed["actions"] ? parsed["actions"] : {});
            const events = Object.keys(parsed["events"] ? parsed["events"] : {});
            const requiredFields = {"properties": [], "actions": [], "events": []};

            // Parse the required interaction affordances
            if (parsed["tm:required"]) {
                for (const field of parsed["tm:required"]) {
                    if (field.startsWith("#properties/"))
                        requiredFields["properties"].push(field.split("/")[1]);
                    else if (field.startsWith("#actions/"))
                        requiredFields["actions"].push(field.split("/")[1]);
                    else if (field.startsWith("#events/"))
                        requiredFields["events"].push(field.split("/")[1]);
                }
            }

            // Create html (checkboxes) for specific interaction affordances
            function createAffordanceHtml(affName, affContainer) {
                return affContainer.map((aff) => {
                    const required = requiredFields[affName].includes(aff);
                    return (
                        <div key={`${affName}/${aff}`} className="form-checkbox py-1 pl-2">
                            <input id={`${affName}/${aff}`}
                                className="form-checkbox-input"
                                type="checkbox"
                                value={`#${affName}/${aff}`}
                                disabled={required}
                                defaultChecked={true}
                                title={required ? "This field is required by the TM." : ""}
                                data-interaction={affName}
                            />
                            <label className="form-checkbox-label pl-2" htmlFor={`${affName}/${aff}`}>{`#${affName}/${aff}`}</label>
                        </div>
                    );
                });
            };

            htmlProperties = createAffordanceHtml("properties", properties);
            htmlActions = createAffordanceHtml("actions", actions);
            htmlEvents = createAffordanceHtml("events", events);

        } catch (ignored) {}

        const divider = (
            <h2 key="modalDividerText" className="text-gray-400 pb-2 pt-4">
                {"Also, select/unselect the interaction affordances you would like to see in the new TD."}
            </h2>
        );

        return [...htmlInputs, divider, ...htmlProperties, ...htmlActions, ...htmlEvents];
    } catch (e) {
        console.log(e);
        return [];
    }
};

const convertTmToTd = (td, htmlInputs) => {
    let mappingObject = {}
    const properties = [];
    const actions = [];
    const events = [];

    // Process the ticked affordances and save them in respective arrays
    for (const item of htmlInputs) {
        if (item.props.className.indexOf("form-checkbox") > -1 &&
        document.getElementById(item.props.children[0].props.id).checked) {
            if (item.props.children[0].props["data-interaction"] === "properties")
                properties.push(item["key"].split("/")[1]);
            else if (item.props.children[0].props["data-interaction"] === "actions")
                actions.push(item["key"].split("/")[1]);
            else if (item.props.children[0].props["data-interaction"] === "events")
                events.push(item["key"].split("/")[1]);
        }
    }

    // Process the placeholders
    htmlInputs = htmlInputs.filter((e) => {
        return e.props.className.indexOf("form-checkbox") === -1 && e.key !== "modalDividerText";
    });
    htmlInputs.forEach((y) => {
        const elem = document.getElementById(y.key)
        mappingObject[y.key] = elem.value
        return elem.value
    });
    Object.keys(mappingObject).forEach(key => {
        td = td.split(`{{${key}}}`).join(mappingObject[key])
    })
    const parse = JSON.parse(td);

    // Create new affordances by leaving only the ticked ones
    if (parse["properties"]) {
        const newProperties = Object.keys(parse["properties"])
            .filter(key => properties.includes(key))
            .reduce((obj, key) => {
                obj[key] = parse["properties"][key];
                return obj;
            }, {});

        // Adapt the new TD
        parse["properties"] = newProperties;
    }

    if (parse["actions"]) {
        const newActions = Object.keys(parse["actions"])
            .filter(key => actions.includes(key))
            .reduce((obj, key) => {
                obj[key] = parse["actions"][key];
                return obj;
            }, {});

        // Adapt the new TD
        parse["actions"] = newActions;
    }

    if (parse["events"]) {
        const newEvents = Object.keys(parse["events"])
            .filter(key => events.includes(key))
            .reduce((obj, key) => {
                obj[key] = parse["events"][key];
                return obj;
            }, {});

        // Adapt the new TD
        parse["events"] = newEvents;
    }

    // Remove TM related data
    delete parse["@type"];
    delete parse["tm:required"];

    let permalink = `${window.location.origin+window.location.pathname}?td=${encodeURIComponent(JSON.stringify(parse))}`;
    window.open(permalink, "_blank");
}
