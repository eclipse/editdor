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
import { RefreshCcw } from "react-feather";

interface IButtonSwapProps {
  description: string;
  value: boolean;
  className?: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const ButtonSwap: React.FC<IButtonSwapProps> = ({
  value,
  description,
  className,
  onClick,
}) => {
  return (
    <div className="grid h-full w-full grid-cols-12 pb-1 pt-1">
      {description ? (
        <div className="col-span-6 flex h-full w-full items-center justify-center font-bold text-white">
          {description}
        </div>
      ) : (
        <div className="col-span-0"></div>
      )}

      <div
        className={`${
          description ? "col-span-4" : "col-span-8"
        } flex h-full w-full items-center justify-center rounded-l-lg bg-gray-600 font-bold text-white`}
      >
        <h1>{value.toString()}</h1>
      </div>
      <div className="col-span-2 h-full w-full pr-1">
        <button
          className="flex h-full w-full cursor-pointer items-center justify-center rounded-r-lg bg-gray-600"
          onClick={onClick}
        >
          <RefreshCcw size={16} color="white" />
        </button>
      </div>
    </div>
  );
};

export default ButtonSwap;
