/********************************************************************************
 * Copyright (c) 2025 Contributors to the Eclipse Foundation
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
import React, { useContext, useEffect, useRef, useState } from "react";
import ediTDorContext from "../../../context/ediTDorContext";
import { changeBetweenTd } from "../../../util";
import AddLinkTdDialog from "../../Dialogs/AddLinkTdDialog";
import InfoIconWrapper from "../../InfoIcon/InfoIconWrapper";
import { getLinksTooltipContent } from "../../InfoIcon/TooltipMapper";
import Link from "./Link";
import BaseButton from "../base/BaseButton";

const LinkSection: React.FC<any> = (props) => {
  const context = useContext(ediTDorContext);

  const addLinkDialog = useRef();
  const handleOpenAddLinkDialog = () => {
    addLinkDialog.current.openModal();
  };

  const td = context.parsedTD;
  const [graphHeight, setGraphHeight] = useState(0);
  const [representationFormat, setRepresentationFormat] = useState("list");
  const [isLinksOpen, setIsLinksOpen] = useState(false);

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
    if (td === undefined || !td.links || !Array.isArray(td.links)) {
      return;
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

    // Check if the links section exists to start drawing
    //Update/refresh the content of the context.linkedTd whenever the the useEffect is triggered
    if (td === undefined || !td.links || !Array.isArray(td.links)) {
      return;
    }

    // Draw the links between Tds
    var currentTdModel = new joint.shapes.standard.Rectangle();
    currentTdModel.position(100, 10);
    currentTdModel.resize(140, 40);
    currentTdModel.attr({
      body: {
        fill: "#005A9C",
      },
      label: {
        text: td["title"],
        fill: "white",
      },
    });
    currentTdModel.set("td", {});
    currentTdModel.resize(
      currentTdModel.attributes.attrs["label"]["text"].length * 12,
      40
    );
    graphTd.addCell(currentTdModel);
    for (const [_, link] of td.links.entries()) {
      if (Object.prototype.toString.call(link) !== "[object Object]") {
        continue;
      }

      posx = posx + 70;
      posy = posy + 60;
      const href = link.href ?? "no href provided";
      const rel = link.rel ?? "";

      const targetTdModel = new joint.shapes.standard.Rectangle();
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
          for (let i = 0; i < td["links"].length; i++) {
            if (href === elementView.model.get("href")) {
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
      let linkShape = new joint.shapes.standard.Link({
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
                text: rel,
                fill: "grey",
              },
            },
          },
        ],
      });
      linkShape.source(currentTdModel);
      linkShape.target(targetTdModel);
      linkShape.addTo(graphTd);
    }
    setGraphHeight(posy + 30);
  }, [
    graphHeight,
    representationFormat,
    context,
    context.linkedTd,
    context.removeLink,
    context.updateLinkedTd,
    context.updateIsModified,
    td,
  ]);

  if (td === undefined) {
    return <></>;
  }

  let links = [];
  if (td.links && Array.isArray(td.links)) {
    for (const [index, link] of td.links.entries()) {
      if (Object.prototype.toString.call(link) !== "[object Object]") {
        continue;
      }

      links.push(<Link link={link} key={index} />);
    }
  }

  return (
    <details className="pt-8">
      <summary className="flex cursor-pointer items-center justify-start">
        <div className="flex flex-grow">
          <InfoIconWrapper tooltip={getLinksTooltipContent()}>
            <h2 className="flex-grow p-1 text-2xl text-white">Links</h2>
          </InfoIconWrapper>

          {isLinksOpen && (
            <BaseButton
              disabled={representationFormat === "list"}
              onClick={() => setRepresentationFormat("list")}
              variant="primary"
              type="button"
              className="h-9"
            >
              List
            </BaseButton>
          )}
          {isLinksOpen && (
            <BaseButton
              disabled={representationFormat === "graph"}
              onClick={() => setRepresentationFormat("graph")}
              variant="primary"
              type="button"
              className="ml-2 h-9"
            >
              Graph
            </BaseButton>
          )}
        </div>
        <BaseButton
          onClick={handleOpenAddLinkDialog}
          variant="primary"
          type="button"
        >
          Add Top Level Link
        </BaseButton>
        <AddLinkTdDialog type="link" interaction={td} ref={addLinkDialog} />
      </summary>
      {links && representationFormat === "graph" && (
        <div className="pt-4">
          <div
            className="rounded-lg bg-gray-600 px-6 pb-4 pt-4"
            id="tdGraph"
          ></div>
        </div>
      )}
      {links && representationFormat === "list" && (
        <div className="pt-4">
          <div className="rounded-lg bg-gray-600 px-6 pb-4 pt-4">{links}</div>
        </div>
      )}
    </details>
  );
};
export default LinkSection;
