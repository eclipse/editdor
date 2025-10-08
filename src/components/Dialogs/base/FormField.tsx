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

interface FormFieldProps {
  label: string;
  placeholder: string;
  id: string;
  type: string;
  autoFocus?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  placeholder,
  id,
  type,
  autoFocus = false,
}) => {
  return (
    <div className="py-1">
      <label htmlFor={id} className="pl-2 text-sm font-medium text-gray-400">
        {label}:
      </label>
      <input
        name={id}
        id={id}
        className="w-full rounded-md border-2 border-gray-600 bg-gray-600 p-2 text-white focus:border-blue-500 focus:outline-none sm:text-sm"
        placeholder={placeholder}
        type={type}
        autoFocus={autoFocus}
      />
    </div>
  );
};

export default FormField;
