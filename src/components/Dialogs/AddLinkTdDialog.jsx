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
import React, {
  forwardRef,
  useCallback,
  useContext,
  useImperativeHandle,
} from "react";
import ReactDOM from "react-dom";
import ediTDorContext from "../../context/ediTDorContext";
import * as fileTdService from "../../services/fileTdService";
import { checkIfLinkIsInItem } from "../../util.js";
import { DialogTemplate } from "./DialogTemplate";

export const AddLinkTdDialog = forwardRef((props, ref) => {
  const context = useContext(ediTDorContext);
  const [display, setDisplay] = React.useState(() => {
    return false;
  });
  const [linkingMethod, setlinkingMethod] = React.useState(() => {
    return "url";
  });
  const [currentLinkedTd, setCurrentLinkedTd] = React.useState(() => {
    return {};
  });

  const interaction = props.interaction ?? {};
  const tdJSON = context.parsedTD;

  useImperativeHandle(ref, () => {
    return {
      openModal: () => open(),
      close: () => close(),
    };
  });

  const open = () => {
    setDisplay(true);
  };

  const close = () => {
    setDisplay(false);
  };

  const checkIfLinkExists = (link) => {
    if (!interaction.links) {
      return false;
    }

    return checkIfLinkIsInItem(link, interaction);
  };

  const addLinksToTd = (link) => {
    tdJSON["links"] = [...(tdJSON["links"] ? tdJSON["links"] : []), link];
    context.updateOfflineTD(JSON.stringify(tdJSON, null, 2));
  };

  const linkingMethodChange = (linkingOption) => {
    setlinkingMethod(linkingOption);
    if (currentLinkedTd && linkingOption === "url") {
      setCurrentLinkedTd({});
    }
  };

  const openFile = useCallback(async () => {
    try {
      const res = await fileTdService.readFromFile();

      document.getElementById("link-href").value = `./${res.fileName}`;
      setCurrentLinkedTd(res.fileHandle ? res.fileHandle : JSON.parse(res.td));
    } catch (error) {
      const msg = "We ran into an error trying to open your TD.";
      console.error(msg, error);
      alert(msg);
    }
  }, []);

  const RelationType = () => {
    const relations = [
      "icon",
      "service-doc",
      "alternate",
      "type",
      "tm:extends",
      "proxy-to",
      "collection",
      "item",
      "predecessor-version",
      "controlledBy",
    ];
    let index = 0;
    const relationsHtml = relations.map((currentRelation) => {
      index++;
      return <option value={currentRelation} key={index} />;
    });
    return relationsHtml;
  };

  const children = (
    <>
      <label className="pl-3 text-sm font-medium text-gray-400">
        Thing Description:
      </label>
      <div className="p-1">{tdJSON["title"]}</div>
      <div className="p-1 pt-2">
        <label htmlFor="rel" className="pl-2 text-sm font-medium text-gray-400">
          Relation:(select one of the proposed relations or type your custom
          relation)
        </label>
        <input
          list="relationType"
          type="text"
          name="rel"
          id="rel"
          className="w-full rounded-md border-2 border-gray-600 bg-gray-600 p-2 text-white focus:border-blue-500 focus:outline-none sm:text-sm"
          placeholder="relation name"
        />
        <datalist id="relationType">
          <RelationType></RelationType>
        </datalist>

        <span id="link-rel-info" className="pl-2 text-xs text-red-400"></span>
      </div>
      <div className="p-1 pt-2">
        <label
          htmlFor="link-href"
          className="pl-2 pr-2 text-sm font-medium text-gray-400"
        >
          Target ressource:
        </label>
        <button
          className="h-9 cursor-pointer rounded-md bg-blue-500 p-2 text-sm font-bold text-white"
          disabled={linkingMethod === "upload"}
          onClick={() => {
            linkingMethodChange("upload");
          }}
        >
          From local machine
        </button>
        <button
          className="h-9 cursor-pointer rounded-md bg-blue-500 p-2 text-sm font-bold text-white"
          style={{ marginLeft: "2%" }}
          disabled={linkingMethod === "url"}
          onClick={() => {
            linkingMethodChange("url");
          }}
        >
          Ressource url
        </button>
        <div className="p-1 pt-4">
          <input
            type="text"
            name="link-href"
            id="link-href"
            className="rounded-md border-2 border-gray-600 bg-gray-600 p-2 text-white focus:border-blue-500 focus:outline-none sm:text-sm"
            placeholder="The target ressource"
            onChange={() => {
              clearHrefErrorMessage();
            }}
            disabled={linkingMethod !== "url"}
          />
          {linkingMethod === "upload" && (
            <button
              className="h-9 cursor-pointer rounded-md bg-blue-500 p-2 text-white"
              onClick={openFile}
              disabled={linkingMethod !== "upload"}
            >
              Open TD
            </button>
          )}
        </div>
        <span id="link-href-info" className="pl-2 text-xs text-red-400"></span>
        <div>
          <label
            htmlFor="type"
            className="pl-2 text-sm font-medium text-gray-400"
          >
            Type:(select one of the proposed types or tape your custom type)
          </label>
          <input
            list="mediaType"
            type="text"
            name="type"
            id="type"
            className="w-full rounded-md border-2 border-gray-600 bg-gray-600 p-2 text-white focus:border-blue-500 focus:outline-none sm:text-sm"
            placeholder="media type"
          />
          <datalist id="mediaType">
            <option value="application/td+json" />
            <option value="image/jpeg" />
            <option value="text/csv" />
            <option value="video/mp4" />
          </datalist>
        </div>
      </div>
    </>
  );

  if (display) {
    return ReactDOM.createPortal(
      <DialogTemplate
        onCancel={close}
        onSubmit={() => {
          if (!context.isValidJSON) {
            showHrefErrorMessage("Can't add link. TD is malformed");
            return;
          }

          let link = {};
          let linkedTd = {};
          const rel = document.getElementById("rel").value;
          const href = document.getElementById("link-href").value;
          const type = document.getElementById("type").value;
          link.href = href !== "" ? href.trim() : "/";
          let isValidUrl = true;
          try {
            var url = new URL(href);
          } catch (_) {
            isValidUrl = false;
          }
          if (
            linkingMethod === "url" &&
            isValidUrl &&
            (url.protocol === "http:" || url.protocol === "https:")
          ) {
            try {
              var httpRequest = new XMLHttpRequest();
              httpRequest.open("GET", href, false);
              httpRequest.send();
              if (
                httpRequest
                  .getResponseHeader("content-type")
                  .includes("application/td+json")
              ) {
                const thingDescription = httpRequest.response;
                let parsedTd = JSON.parse(thingDescription);
                linkedTd[href] = parsedTd;
              }
            } catch (ex) {
              const msg = "We ran into an error trying to fetch your TD.";
              console.error(msg, ex);
              linkedTd[href] = currentLinkedTd;
            }
          } else {
            linkedTd[href] = currentLinkedTd;
          }
          if (rel !== "") {
            link.rel = rel.trim();
          }
          if (type !== "") {
            link.type = type.trim();
          }

          if (href === "") {
            showHrefErrorMessage("The href field is mandatory ...");
          } else if (checkIfLinkExists(link)) {
            showHrefErrorMessage(
              "A Link with the target Thing Description already exists ..."
            );
          } else {
            addLinksToTd(link);
            context.addLinkedTd(linkedTd);
            setCurrentLinkedTd({});
            close();
          }
        }}
        submitText={"Add"}
        children={children}
        title={`Add Link `}
        description={`Tell us how this ${tdJSON.title} can interact with other ressources`}
      />,
      document.getElementById("modal-root")
    );
  }

  return null;
});

const showHrefErrorMessage = (msg) => {
  document.getElementById("link-href-info").textContent = msg;
  document.getElementById("link-href").classList.remove("border-gray-600");
  document.getElementById("link-href").classList.add("border-red-400");
};

const clearHrefErrorMessage = () => {
  document.getElementById("link-href").classList.add("border-gray-600");
  document.getElementById("link-href").classList.remove("border-red-400");
};
