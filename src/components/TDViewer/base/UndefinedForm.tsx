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
import React, { useContext } from "react";
import { Trash2 } from "react-feather";
import ediTDorContext from "../../../context/ediTDorContext";
import type { IFormProps } from "../../../types/form";

interface IUndefinedFormProps {
  level: string;
  form: IFormProps;
}

const UndefinedForm: React.FC<IUndefinedFormProps> = ({ level, form }) => {
  const context = useContext(ediTDorContext);

  return (
    <div className="flex min-h-10 w-full items-stretch rounded-md border-2 border-gray-300 bg-gray-300 bg-opacity-75 pl-4">
      <div className="flex h-6 min-w-20 justify-center place-self-center rounded-md bg-white">
        <div
          className={`place-self-center px-4 text-center text-xs text-black`}
        >
          Undefined
        </div>
      </div>
      <div className="flex-grow place-self-center overflow-hidden pl-3 text-white">
        {form.href}
      </div>
      <button
        className="flex w-10 items-center justify-center bg-gray-300"
        onClick={() =>
          context.removeForm(level, form.propName, form, form.actualIndex)
        }
      >
        <Trash2 size={16} color="black" />
      </button>
    </div>
  );
};

export default UndefinedForm;
