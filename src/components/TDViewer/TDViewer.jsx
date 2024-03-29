/********************************************************************************
 * Copyright (c) 2018 - 2022 Contributors to the Eclipse Foundation
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
import * as joint from "jointjs";
import React, { useContext, useEffect, useState } from "react";
import { ImCheckmark, ImCross } from "react-icons/im";
import "../../assets/main.css";
import ediTDorContext from "../../context/ediTDorContext";
import { buildAttributeListObject, changeBetweenTd, getDirectedValue, separateForms } from "../../util";
import { AddFormDialog } from "../Dialogs/AddFormDialog";
import { AddLinkTdDialog } from "../Dialogs/AddLinkTdDialog";
import { InfoIconWrapper } from "../InfoIcon/InfoIcon";
import { getFormsTooltipContent, getLinksTooltipContent } from "../InfoIcon/InfoTooltips";
import Form from "./Form";
import { InteractionSection } from "./InteractionSection";
import Link from "./Link";
import { RenderedObject } from "./RenderedObject";

export default function TDViewer() {
  const context = useContext(ediTDorContext);

  const addFormDialog = React.useRef();
  const openAddFormDialog = () => {
    addFormDialog.current.openModal();
  };

  const [jsonSchemaValidation, setJsonSchemaValidation] = useState(undefined);
  const [jsonValidation, setJsonValidation] = useState(undefined);
  const [jsonValidationError, setJsonValidationError] = useState(undefined);
  const [jsonSchemaValidationError, setJsonSchemaValidationError] = useState(undefined);

  const [td, setTd] = useState(undefined);

  const addLinkDialog = React.useRef();
  const openAddLinkDialog = () => {
    addLinkDialog.current.openModal();
  };

  const [graphHeight, setGraphHeight] = React.useState(() => {
    return 0;
  });
  const [representationFormat, setRepresentationFormat] = React.useState(() => {
    return "list";
  });
  const [isLinksOpen, setIsLinksOpen] = React.useState(() => {
    return false;
  });

  const representationFormatChange = (representationFormat) => {
    setRepresentationFormat(representationFormat);
  };

  useEffect(() => {
    if (document.getElementsByTagName("details")[1]) {
      document.getElementsByTagName("details")[1].addEventListener(
        "toggle",
        function (_) {
          if (document.getElementsByTagName("details")[1].attributes.open) {
            setIsLinksOpen(true);
          } else {
            setIsLinksOpen(false);
          }
        },
        false
      );
    }
    let posx = 100;
    let posy = 30;
    // This graph is used to draw the thing description elements
    let graphTd = new joint.dia.Graph();
    let paperTd = new joint.dia.Paper({
      el: document.getElementById("tdGraph"),
      model: graphTd,
      height: 270 + graphHeight,
      width: 850,
      gridSize: 10,
      drawGrid: true,
      restrictTranslate: true,
    });
    let offlineTD = {};
    if (context.offlineTD) {
      try {
        offlineTD = JSON.parse(context.offlineTD);
      } catch (e) {
        console.debug(e);
      }
    }
    // Check if the links section exists to start drawing
    //Update/refresh the content of the context.linkedTd whenever the the useEffect is triggered
    if (offlineTD["links"]) {
      // Draw the links between Tds
      var currentTdModel = new joint.shapes.standard.Rectangle();
      currentTdModel.position(100, 10);
      currentTdModel.resize(140, 40);
      currentTdModel.attr({
        body: {
          fill: "#005A9C",
        },
        label: {
          text: offlineTD["title"],
          fill: "white",
        },
      });
      currentTdModel.set("td", {});
      currentTdModel.resize(
        currentTdModel.attributes.attrs["label"]["text"].length * 12,
        40
      );
      graphTd.addCell(currentTdModel);
      for (let i = 0; i < offlineTD["links"].length; i++) {
        posx = posx + 70;
        posy = posy + 60;
        let href = offlineTD["links"][i]["href"];
        let targetTdModel = new joint.shapes.standard.Rectangle();
        //Draw as many rectangles as there are links in the links section
        targetTdModel.position(posx, posy);
        targetTdModel.attr({
          body: {
            fill: "#005A9C",
          },
          label: {
            text: href,
            fill: "white",
          },
        });
        targetTdModel.resize(
          targetTdModel.attributes.attrs["label"]["text"].length * 12,
          40
        );
        graphTd.addCell(targetTdModel);
        targetTdModel.set("href", href);
        var removeButton = new joint.elementTools.Remove({
          useModelGeometry: true,
          y: "0%",
          x: "100%",
          action: async function (evt, elementView, buttonView) {
            if (context.linkedTd) {
              let currentLinkedTd = context.linkedTd;
              //update the linkedTd after removing the current linked Td
              if (currentLinkedTd[elementView.model.get("href")]) {
                delete currentLinkedTd[elementView.model.get("href")];
                context.updateLinkedTd(currentLinkedTd);
              }
            }
            for (let i = 0; i < offlineTD["links"].length; i++) {
              if (
                offlineTD["links"][i]["href"] === elementView.model.get("href")
              ) {
                context.removeLink(i);
                context.updateIsModified(true);
                break;
              }
            }
          },
        });
        var toolsView = new joint.dia.ToolsView({
          tools: [removeButton],
        });
        var elementView = targetTdModel.findView(paperTd);
        elementView.addTools(toolsView);
        if (
          context.linkedTd &&
          context.linkedTd[href] &&
          (context.linkedTd[href]["kind"] === "file" ||
            Object.keys(context.linkedTd[href]).length)
        ) {
          targetTdModel.set("td", context.linkedTd[href]);
          var infoButton = new joint.elementTools.Button({
            markup: [
              {
                tagName: "circle",
                selector: "button",
                attributes: {
                  r: 7,
                  fill: "#008FF5",
                  cursor: "pointer",
                },
              },
              {
                tagName: "path",
                selector: "icon",
                attributes: {
                  d: "M -2 4 2 4 M 0 3 0 0 M -2 -1 1 -1 M -1 -4 1 -4",
                  fill: "none",
                  stroke: "#FFFFFF",
                  "stroke-width": 2,
                  "pointer-events": "none",
                },
              },
            ],
            x: "0%",
            y: "0%",
            rotate: true,
            action: async function (evt, elementView, buttonView) {
              let href = elementView.model.get("href");
              changeBetweenTd(context, href);
            },
          });
          let toolsView = new joint.dia.ToolsView({
            tools: [removeButton, infoButton],
          });
          elementView.addTools(toolsView);
        }
        let link = new joint.shapes.standard.Link({
          attrs: {
            line: {
              stroke: "#005A9C",
            },
          },
          labels: [
            {
              position: 0.6,
              attrs: {
                text: {
                  text:
                    offlineTD["links"][i]["rel"] === undefined
                      ? ""
                      : offlineTD["links"][i]["rel"],
                  fill: "grey",
                },
              },
            },
          ],
        });
        link.source(currentTdModel);
        link.target(targetTdModel);
        link.addTo(graphTd);
      }
      setGraphHeight(posy + 30);
    }

    const validationMessage = context.validationMessage;
    if (!validationMessage) {
      return;
    }

    if (validationMessage.report) {
      setJsonValidation(validationMessage.report.json);
      setJsonSchemaValidation(validationMessage.report.schema);
    }

    if (validationMessage.validationErrors) {
      setJsonValidationError(validationMessage.validationErrors.json);
      setJsonSchemaValidationError(validationMessage.validationErrors.schema);

      console.debug("JSON validation error", jsonValidationError);
      console.debug("JSON Schema validation error", jsonSchemaValidationError);
    } else {
      setJsonValidationError(undefined);
      setJsonSchemaValidationError(undefined);
    }
  }, [graphHeight, representationFormat, context, jsonSchemaValidationError, jsonValidationError]);

  useEffect(() => {
    try {
      setTd(JSON.parse(context.offlineTD));
    } catch (e) {
      console.debug(e);
    }
  }, [context.offlineTD]);

  if (!td || !Object.keys(td).length) {
    return (
      <div className="flex h-full w-full bg-gray-500 justify-center align-center text-center ">
        <div className="text-4xl text-white place-self-center">
          Start writing a new TD by clicking "New TD"
        </div>
      </div>
    );
  }

  let forms;
  let links;

  if (td) {
    if (td.forms) {
      const formsSeparated = separateForms(td.forms);
      forms = formsSeparated.map((key, index) => {
        return <Form form={key} propName={index} key={index} />;
      });
    }
    if (td.links) {
      const linksfromTd = td.links;
      links = linksfromTd.map((key, index) => {
        return <Link link={key} propName={index} key={index} />;
      });
    }

    const alreadyRenderedKeys = [
      "id",
      "properties",
      "actions",
      "events",
      "forms",
      "description",
      "title",
      "links",
    ];
    const attributeListObject = buildAttributeListObject(
      td.id ? { id: td.id } : {},
      td,
      alreadyRenderedKeys
    );

    return (
      <div className="h-full w-full bg-gray-500 p-8 overflow-auto">
        <div className="container bg-white text-black rounded-md p-4 mb-4">
          <div className="flex">
            <h3>JSON Validation</h3>
            {jsonValidation === "passed" && (
              <ImCheckmark
                style={{
                  marginLeft: "5px",
                  position: "relative",
                  top: "5px",
                }}
              />
            )}
            {jsonValidation === "failed" && (
              <ImCross
                style={{
                  marginLeft: "5px",
                }}
              />
            )}
          </div>
          {jsonValidationError && (
            <div className="flex h-10 w-full bg-formRed rounded-md px-4 mt-2 bg-opacity-75 border-2 border-formRed">
              <div className="flex h-6 w-16 bg-white rounded-md place-self-center justify-center">
                <div className="text-formRed place-self-center text-center text-xs px-4">
                  Error
                </div>
              </div>
              <div className=" place-self-center pl-3 text-base text-white overflow-hidden">
                {jsonValidationError}
              </div>
            </div>
          )}

          <div className="flex">
            <h2>JSON Schema Validation </h2>
            {jsonSchemaValidation === "passed" && (
              <ImCheckmark
                style={{
                  marginLeft: "5px",
                }}
              />
            )}
            {jsonSchemaValidation === "failed" && (
              <ImCross
                style={{
                  marginLeft: "5px",
                  position: "relative",
                  top: "5px",
                }}
              />
            )}
          </div>
          {jsonSchemaValidationError && (
            <div className="flex h-full w-full bg-formRed rounded-md px-4 mt-2 bg-opacity-75 border-2 border-formRed">
              <div className="flex h-6 w-16 bg-white rounded-md place-self-center justify-center">
                <div className="text-formRed place-self-center text-center text-xs px-4">
                  Error
                </div>
              </div>
              <div className=" place-self-center pl-3 text-base text-white overflow-hidden">
                {jsonSchemaValidationError}
              </div>
            </div>
          )}
        </div>        {td !== undefined && Object.keys(td).length > 0 && (
          <div>
            <div className="text-3xl text-white">
              {td.title ?
                getDirectedValue(td, "title", td["@context"]) :
                <></>
              }
            </div>
            {td.description ?
              <div className="text-xl text-white pt-4">
                {getDirectedValue(
                  td,
                  "description",
                  td["@context"]
                )}
              </div>
              :
              <></>
            }
            <div className="pt-4">
              <RenderedObject  {...attributeListObject}></RenderedObject>
            </div>
          </div>
        )}
        <details className="pt-8">
          <summary className="flex justify-start items-center cursor-pointer">
            <div className="flex flex-grow">
              <InfoIconWrapper tooltip={getFormsTooltipContent()}>
                <h2 className="text-2xl text-white p-1 flex-grow">Forms</h2>
              </InfoIconWrapper>
            </div>
            <button
              className="text-white font-bold text-sm bg-blue-500 cursor-pointer rounded-md p-2"
              onClick={openAddFormDialog}
            >
              Add Top Level Form
            </button>
            <AddFormDialog
              type="thing"
              interaction={td}
              ref={addFormDialog}
            />
          </summary>
          {forms && (
            <div className="pt-4">
              <div className="rounded-lg bg-gray-600 px-6 pt-4 pb-4">
                {forms}
              </div>
            </div>
          )}
        </details>

        <details className="pt-8">
          <summary className="flex justify-start items-center cursor-pointer">
            <div className="flex flex-grow">
              <InfoIconWrapper tooltip={getLinksTooltipContent()}>
                <h2 className="text-2xl text-white p-1 flex-grow">Links</h2>
              </InfoIconWrapper>

              {isLinksOpen && (
                <button
                  className="text-white font-bold text-sm bg-blue-500 cursor-pointer rounded-md p-2 h-9"
                  disabled={representationFormat === "list"}
                  onClick={() => representationFormatChange("list")}
                >
                  List
                </button>
              )}
              {isLinksOpen && (
                <button
                  className="text-white font-bold text-sm bg-blue-500 cursor-pointer rounded-md p-2 h-9"
                  style={{ marginLeft: "10px" }}
                  disabled={representationFormat === "graph"}
                  onClick={() => representationFormatChange("graph")}
                >
                  Graph
                </button>
              )}
            </div>
            <button
              className="text-white font-bold text-sm bg-blue-500 cursor-pointer rounded-md p-2"
              onClick={openAddLinkDialog}
            >
              Add Top Level Link
            </button>
            <AddLinkTdDialog
              type="link"
              interaction={td}
              ref={addLinkDialog}
            />
          </summary>
          {links && representationFormat === "graph" && (
            <div className="pt-4">
              <div
                className="rounded-lg bg-gray-600 px-6 pt-4 pb-4"
                id="tdGraph"
              ></div>
            </div>
          )}
          {links && representationFormat === "list" && (
            <div className="pt-4">
              <div className="rounded-lg bg-gray-600 px-6 pt-4 pb-4">
                {links}
              </div>
            </div>
          )}
        </details>

        <InteractionSection interaction="Properties"></InteractionSection>
        <InteractionSection interaction="Actions"></InteractionSection>
        <InteractionSection interaction="Events"></InteractionSection>
      </div>
    );
  }
}
