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
import React from "react";
import InfoIconWrapper from "../../base/InfoIconWrapper";
import ButtonSwap from "../base/ButtonSwap";

interface SingleSwapButtonProps {
  idIcon: string;
  onUpdateValue: (newValue: boolean) => void;
  tooltip: { html: string; href: string };
  textLabel: string;
  valueButton: boolean;
}

const SingleSwapButton: React.FC<SingleSwapButtonProps> = ({
  idIcon,
  onUpdateValue: onUpdateValue,
  tooltip,
  textLabel,
  valueButton,
}) => {
  return (
    <>
      <div className="col-span-4 grid h-full w-full grid-cols-12 gap-1 rounded-md">
        <div className="col-span-6 flex items-center justify-center rounded-l-md bg-blue-500">
          <InfoIconWrapper tooltip={tooltip} id={idIcon}>
            <h1 className="p-2 font-bold text-white">{textLabel}</h1>
          </InfoIconWrapper>
        </div>
        <div className="col-span-6 rounded-r-md bg-blue-500">
          <div className="grid h-full w-full grid-cols-12">
            <div className="col-span-12"></div>
            <div className="col-span-12">
              <div className="grid h-full w-full grid-cols-12">
                <div id="firstRow" className="col-span-12 bg-blue-500">
                  <ButtonSwap
                    description=""
                    value={valueButton}
                    onClick={() => onUpdateValue(!valueButton)}
                  />
                </div>
              </div>
            </div>
            <div className="col-span-12"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SingleSwapButton;
