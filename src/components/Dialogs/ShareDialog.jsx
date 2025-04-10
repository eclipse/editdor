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
import React, { forwardRef, useContext, useImperativeHandle } from "react";
import ReactDOM from "react-dom";
import ediTDorContext from "../../context/ediTDorContext";
import { prepareTdForSharing } from "../../share";
import { DialogTemplate } from "./DialogTemplate";

export const ShareDialog = forwardRef((props, ref) => {
  const context = useContext(ediTDorContext);
  const [display, setDisplay] = React.useState(false);
  const [compressedTdLink, setCompressedTdLink] = React.useState("");
  const [compressedTd, setCompressedTd] = React.useState("");

  useImperativeHandle(ref, () => {
    return {
      openModal: () => open(),
      close: () => close(),
    };
  });

  const open = () => {
    setDisplay(true);

    const tmpCompressedTd = prepareTdForSharing(context.offlineTD);
    setCompressedTd(tmpCompressedTd);

    const tmpCompressedTdLink = `${window.location.origin + window.location.pathname}?td=${tmpCompressedTd}`;
    setCompressedTdLink(tmpCompressedTdLink);

    copyLinkToClipboard(tmpCompressedTdLink);
    focusPermalinkField();
  };

  const close = () => {
    setDisplay(false);
  };

  let child = (
    <input
      type="text"
      name="share-td-field"
      id="share-td-field"
      className="w-full rounded-md border-2 border-gray-600 bg-gray-600 p-2 text-white focus:border-blue-500 focus:outline-none sm:text-sm"
      defaultValue={compressedTdLink}
    />
  );

  if (display) {
    return ReactDOM.createPortal(
      <DialogTemplate
        hasSubmit={true}
        onCancel={close}
        cancelText={"Okay"}
        submitText={"Open in Playground"}
        onSubmit={() => {
          window.open(`https://playground.thingweb.io//#${compressedTd}`);
          close();
        }}
        children={child}
        title={"Share This TD"}
        description={"A link to this TD was copied to your clipboard."}
      />,
      document.getElementById("modal-root")
    );
  }

  return null;
});

const copyLinkToClipboard = (compressedTdLink) => {
  if (document.hasFocus()) {
    navigator.clipboard.writeText(compressedTdLink).then(
      function () {
        console.log("Async: Copied TD link to clipboard!");
      },
      function (err) {
        console.error("Async: Could not copy TD to clipboard: ", err);
      }
    );
  }
};

const focusPermalinkField = () => {
  setTimeout(() => {
    try {
      const textfield = document.getElementById("share-td-field");
      textfield.select();
    } catch (_) {}
  }, 250);
};
