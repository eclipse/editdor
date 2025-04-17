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
import React, { useContext, useCallback, useState } from "react";
import ediTDorContext from "../../../context/ediTDorContext";
import { ChevronRight, ChevronDown } from "react-feather";
import { getDirectedValue } from "../../../util";

function isObject(val) {
  if (val === null) {
    return false;
  }
  return typeof val === "function" || typeof val === "object";
}

export const RenderedObject = (map) => {
  const context = useContext(ediTDorContext);
  const [showChildren, setShowChildren] = useState(
    new Array(Object.entries(map).length)
  );
  const handleClick = useCallback(
    (i) => {
      let temp = showChildren;
      let x = showChildren[i];
      temp[i] = x === null ? true : !x;
      setShowChildren([...temp]);
    },
    [showChildren, setShowChildren]
  );

  return (
    <>
      {Object.entries(map).map(([k, v], i) => {
        if (isObject(v)) {
          let indicator = (
            <button className="flex align-top" onClick={() => handleClick(i)}>
              <div className="flex rounded-md bg-gray-600 px-2 py-1 align-middle font-bold text-white">
                <h4>{k}</h4>
                {showChildren[i] === true ? (
                  <ChevronDown className="pl-1" />
                ) : (
                  <ChevronRight className="pl-1" />
                )}
              </div>
            </button>
          );

          let children = (
            <div className="flex">
              <div className="my-1 ml-2 flex w-1 rounded-lg bg-gray-400" />
              <div className="mt-1 pl-8">
                {showChildren[i] === true &&
                  (Object.entries(v) ?? []).map(([k1, v1], i1) => {
                    let m1 = {};
                    m1[k1] = v1;
                    return <RenderedObject {...m1} key={i1} />;
                  })}
              </div>
            </div>
          );

          return (
            <div className="mb-1" key={i}>
              {indicator}
              {showChildren[i] === true && children}
            </div>
          );
        }

        const value = getDirectedValue(
          map,
          k,
          context.linkedTd[Object.keys(context.linkedTd)[0]]["@context"]
        );
        return (
          <div className="mb-1 flex" key={i}>
            <h4 className="rounded-md bg-gray-600 px-2 py-1 font-bold text-white">
              {k}
            </h4>
            <div className="px-2 py-1 text-gray-400">{value}</div>
          </div>
        );
      })}
    </>
  );
};
