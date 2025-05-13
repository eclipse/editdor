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
import { PlusCircle } from "react-feather";

interface IAddFormElementProps {
  onClick: () => void;
}

const AddFormElement: React.FC<IAddFormElementProps> = ({ onClick }) => {
  return (
    <button
      className="border-formBlue bg-formBlue flex min-h-10 w-full items-stretch rounded-md border-2 bg-opacity-75 pl-4"
      onClick={onClick}
    >
      <div className="flex items-center justify-center">
        <PlusCircle color="white" size="20" />
        <div className={`pl-2 text-center text-white`}>
          Click to add Form...
        </div>
      </div>
    </button>
  );
};

export default AddFormElement;
