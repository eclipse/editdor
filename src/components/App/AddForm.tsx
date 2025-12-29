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
import { OperationsMap, OperationsType } from "../Dialogs/AddFormDialog";
import FormCheckbox from "../base/FormCheckbox";
import TextField from "../base/TextField";

interface AddFormProps {
  type: OperationsType;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  operations: (type: OperationsType) => OperationsMap;
  value?: string;
  error?: string;
}

const AddForm: React.FC<AddFormProps> = ({
  type,
  onInputChange,
  operations,
  value = "",
  error = "",
}) => {
  const inputClasses =
    "w-full rounded-md border-2 bg-gray-600 p-2 text-white focus:outline-none sm:text-sm " +
    (error
      ? "border-red-400 focus:border-red-400"
      : "border-gray-600 focus:border-blue-500");

  return (
    <>
      <label className="pl-3 text-sm font-medium text-gray-400">
        Operations:
      </label>
      <div className="p-1">
        <div className="rounded-md bg-gray-600 p-1">
          {operations(type).map((name) => (
            <FormCheckbox key={`form-${name}`} name={name} />
          ))}
        </div>
      </div>
      <TextField
        id="form-href"
        label="Href:"
        value={value}
        placeholder="http://example.com/href"
        onChange={onInputChange}
        className={inputClasses}
        error={error}
      ></TextField>
    </>
  );
};

export default AddForm;
