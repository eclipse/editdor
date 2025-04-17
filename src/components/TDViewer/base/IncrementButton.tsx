/********************************************************************************
 * Copyright (c) 2018 - 2025 Contributors to the Eclipse Foundation
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

const IncrementButton: React.FC<IIncrementButtonProps> = ({ value, onUpdate }) => {
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
      <div className="col-span-12">
        <div className="flex h-full items-center">
          <div className="grid h-full w-full grid-cols-12 items-center px-4 py-6">
            <div className="col-span-8 h-full w-full bg-gray-600 text-center font-bold text-white">
              <div className="grid h-full w-full grid-cols-12 p-2">
                <div className="col-span-12 h-full text-center"></div>
                <div className="col-span-12 h-full justify-items-center py-2 text-center text-2xl font-bold text-white">
                  {value.toString()}
                </div>
                <div className="h-fulltext-center col-span-12"></div>
              </div>
            </div>

            <div className="col-span-4 bg-gray-600">
              <div className="grid h-full w-full grid-cols-12">
                <div className="col-span-12 mt-2 p-1">
                  <button className="bg-gray-600" onClick={increment}>
                    <Plus width="full" height="full" color="white"></Plus>
                  </button>
                </div>
                <div className="col-span-12 mb-2 p-1 text-center text-white">
                  <button className="bg-gray-600" onClick={decrement}>
                    <Minus width="full" height="full" color="white"></Minus>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IncrementButton;
