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
import React, { useEffect, useState } from "react";

interface TmInputFormProps {
  inputValues: Record<string, string>;
  onValueChange: (placeholder: string, value: string) => void;
}

const TmInputForm: React.FC<TmInputFormProps> = ({
  inputValues,
  onValueChange,
}) => {
  const [localValues, setLocalValues] =
    useState<Record<string, string>>(inputValues);

  useEffect(() => {
    setLocalValues(inputValues);
  }, [inputValues]);

  const handleChange = (placeholder: string, value: string) => {
    setLocalValues((prev) => ({
      ...prev,
      [placeholder]: value,
    }));
  };

  const handleBlur = (placeholder: string, value: string) => {
    onValueChange(placeholder, value);
  };

  return (
    <div className="placeholder-inputs-container w-full">
      {Object.keys(inputValues).map((placeholder) => (
        <div key={placeholder} className="py-1">
          <label
            htmlFor={`tm-input-${placeholder}`}
            className="pl-2 text-sm font-medium text-gray-400"
          >
            {placeholder}:
          </label>
          <input
            id={`tm-input-${placeholder}`}
            type="text"
            name={placeholder}
            value={localValues[placeholder] || ""}
            onChange={(e) => handleChange(placeholder, e.target.value)}
            onBlur={(e) => handleBlur(placeholder, e.target.value)}
            className="w-full rounded-md border-2 border-gray-600 bg-gray-600 p-2 text-white outline-none hover:border-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter a value..."
          />
        </div>
      ))}
    </div>
  );
};

export default TmInputForm;
