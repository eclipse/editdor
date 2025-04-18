/********************************************************************************
 * Copyright (c) 2018 Contributors to the Eclipse Foundation
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
import { Plus, Minus } from "react-feather";
import { useState } from "react";

interface IIncrementButtonProps {
  value: number;
  onUpdate: (newValue: number) => void;
}

const IncrementButton: React.FC<IIncrementButtonProps> = ({
  value,
  onUpdate,
}) => {
  const increment = () => {
    const newValue = value < 255 ? value + 1 : 0;
    onUpdate(newValue);
  };

  const decrement = () => {
    const newValue = value > 0 ? value - 1 : 255;
    onUpdate(newValue);
  };

  return (
    <>
      <div className="grid h-full w-full grid-cols-12">
        <div className="col-span-0"></div>
        <div className="col-span-6 flex h-full w-full items-center justify-center rounded-l-lg bg-gray-600 font-bold text-white">
          <h1>{value.toString()}</h1>
        </div>
        <div className="col-span-4 flex h-full w-full">
          <button
            className="justify-centers flex h-full w-full cursor-pointer items-center bg-gray-600"
            onClick={increment}
          >
            <Plus size={18} color="white" />
          </button>
          <button
            className="flex h-full w-full cursor-pointer items-center justify-center rounded-r-lg bg-gray-600"
            onClick={decrement}
          >
            <Minus size={18} color="white" />
          </button>
        </div>
      </div>
    </>
  );
};

export default IncrementButton;
