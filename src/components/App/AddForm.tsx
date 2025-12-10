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

interface AddFormProps {
  type: OperationsType;
  onHrefInputChange: () => void;
  operations: (type: OperationsType) => OperationsMap;
  defaultValue?: string;
}

const AddForm: React.FC<AddFormProps> = ({
  type,
  onHrefInputChange,
  operations,
  defaultValue = "",
}) => {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <>
      <label className="pl-3 text-sm font-medium text-gray-400">
        Operations:
      </label>
      <div className="p-1">
        <div className="rounded-md bg-gray-600 p-1">
          {operations(type).map((name) => {
            const id = `form-${name}`;
            const isInvoke = name === "invokeaction";
            return (
              <div key={id} className="form-checkbox pl-2">
                <input
                  id={id}
                  className="form-checkbox-input"
                  type="checkbox"
                  value={name}
                  readOnly={isInvoke}
                  checked={isInvoke || undefined}
                />
                <label className="form-checkbox-label pl-2" htmlFor={id}>
                  {name}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-1 pt-2">
        <label
          htmlFor="form-href"
          className="pl-2 text-sm font-medium text-gray-400"
        >
          Href:
        </label>
        <input
          type="text"
          name="form-href"
          value={defaultValue}
          id="form-href"
          className="w-full rounded-md border-2 border-gray-600 bg-gray-600 p-2 text-white focus:border-blue-500 focus:outline-none sm:text-sm"
          placeholder="http://example.com/href"
          onChange={(e) => {
            setValue(e.target.value);
            onHrefInputChange();
          }}
        />
        <span id="form-href-info" className="pl-2 text-xs text-red-400"></span>
      </div>
    </>
  );
};

export default AddForm;
