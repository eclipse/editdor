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

interface IDoubleSwapButtonProps {
  idIcon: string;
  tooltip: { html: string; href: string };
  textLabel: string;
  compactText: string;
  customBreakpoints: number;
  firstDescription: string;
  firstValue: boolean;
  firsthandleOnClick: (newValue: boolean, key: string) => void;
  secondDescription: string;
  secondValue: boolean;
  secondhandleOnClick: (newValue: boolean, key: string) => void;
}

const DoubleSwapButton: React.FC<IDoubleSwapButtonProps> = ({
  idIcon,
  tooltip,
  textLabel,
  compactText,
  customBreakpoints,
  firstDescription,
  firstValue,
  firsthandleOnClick,
  secondDescription,
  secondValue,
  secondhandleOnClick,
}) => {
  return (
    <>
      <div className="col-span-4 grid h-full w-full grid-cols-12 gap-1 rounded-md">
        <div className="col-span-4 flex items-center justify-center rounded-l-md bg-blue-500">
          <InfoIconWrapper tooltip={tooltip} id={idIcon}>
            <h1 className="p-2 font-bold text-white">
              {customBreakpoints === 1 ? compactText : textLabel}
            </h1>
          </InfoIconWrapper>
        </div>
        <div className="col-span-8 rounded-r-md">
          <div className="grid h-full w-full grid-cols-12">
            <div
              id="firstRow"
              className="col-span-12 rounded-tr-md bg-blue-500"
            >
              <ButtonSwap
                description={firstDescription}
                value={firstValue}
                onClick={() => firsthandleOnClick(firstValue, firstDescription)}
              />
            </div>
            <div
              id="secondRow"
              className="col-span-12 rounded-br-md bg-blue-500"
            >
              <ButtonSwap
                description={secondDescription}
                value={secondValue}
                onClick={() =>
                  secondhandleOnClick(secondValue, secondDescription)
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoubleSwapButton;
