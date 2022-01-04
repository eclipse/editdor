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
import React, { useContext } from "react";
import "../../assets/main.css"
import ediTDorContext from "../../context/ediTDorContext";
import { Trash2, Info } from "react-feather";
import { changeBetweenTd } from '../../util';

export default function Link(props) {

  const context = useContext(ediTDorContext)
  const deleteLink = (e) => {
    let currentLinkedTd = context.linkedTd;
    //update the linkedTd after removing the current linked Td
    if (currentLinkedTd[e.link.href]) {
      delete currentLinkedTd[e.link.href];
      context.updateLinkedTd(currentLinkedTd);
    }
    context.removeLink(e.propName);
    context.updateIsModified(true);

  }
  const infoLink = async (e) => {
    let href = e.link.href;
    changeBetweenTd(context, href);
  }
  return (
    <div className="flex flex-row items-center justify-start h-10 w-full bg-formBlue rounded-md px-4 mt-2 bg-opacity-75 border-2 border-formBlue">
      <div className="flex h-6 w-18 bg-white rounded-md place-self-center justify-center">
        {props.link.rel && <div className="text-formBlue place-self-center text-center text-xs px-4">{props.link.rel}</div>}
      </div>
      <div className=" place-self-center pl-3 text-base text-white overflow-hidden flex-grow">{props.link.href}</div>
      <button className="text-base w-6 h-6 p-1 m-1 shadow-md rounded-full bg-formBlue" onClick={() => deleteLink(props)}>
        <Trash2 size={16} color="black" />
      </button>
      {context.linkedTd && context.linkedTd[props.link.href] && ((Object.keys(context.linkedTd[props.link.href]).length) || context.linkedTd[props.link.href]["kind"] === "file") &&
        <button className="text-base w-6 h-6 p-1 m-1 shadow-md rounded-full bg-formBlue" onClick={() => infoLink(props)}>
          <Info size={16} color="black" />
        </button>}
    </div>
  );
}
