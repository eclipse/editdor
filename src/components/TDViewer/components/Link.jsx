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
import React, { useContext } from "react";
import ediTDorContext from "../../../context/ediTDorContext";
import { Trash2, Info } from "react-feather";
import { changeBetweenTd } from "../../../util";

export default function Link(props) {
  const context = useContext(ediTDorContext);
  const deleteLink = (e) => {
    let currentLinkedTd = context.linkedTd;
    //update the linkedTd after removing the current linked Td
    if (currentLinkedTd[e.link.href]) {
      delete currentLinkedTd[e.link.href];
      context.updateLinkedTd(currentLinkedTd);
    }
    context.removeLink(e.propName);
    context.updateIsModified(true);
  };
  const infoLink = async (e) => {
    let href = e.link.href;
    changeBetweenTd(context, href);
  };
  return (
    <div className="bg-formBlue border-formBlue mt-2 flex min-h-12 w-full items-stretch rounded-md border-2 bg-opacity-75 pl-4">
      <div className="flex h-8 min-w-20 justify-center place-self-center rounded-md bg-white">
        <div className="text-formBlue place-self-center px-4 text-center">
          {props.link.rel ?? "-"}
        </div>
      </div>

      <div className="flex-grow place-self-center overflow-hidden pl-3 text-base text-white">
        {props.link.href}
      </div>

      {context.linkedTd &&
        context.linkedTd[props.link.href] &&
        (Object.keys(context.linkedTd[props.link.href]).length ||
          context.linkedTd[props.link.href]["kind"] === "file") && (
          <button
            className="bg-formBlue border-formBlue flex w-10 items-center justify-center border-r-2"
            onClick={() => infoLink(props)}
          >
            <Info size={16} color="black" />
          </button>
        )}

      <button
        className="bg-formBlue flex w-10 items-center justify-center"
        onClick={() => deleteLink(props)}
      >
        <Trash2 size={16} color="black" />
      </button>
    </div>
  );
}
