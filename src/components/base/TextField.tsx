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
import React, { ReactNode } from "react";

interface ITextFieldProps {
  id: string;
  label: string | ReactNode;
  value?: string;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  helperText?: string | ReactNode;
}

const TextField: React.FC<ITextFieldProps> = (props) => {
  return (
    <div key={props.id} className="py-1">
      <label
        htmlFor={props.id}
        className="pl-2 text-sm font-medium text-gray-400"
      >
        {props.label}
      </label>
      {props.helperText && (
        <div className="pb-1 pl-10 text-sm text-white">{props.helperText}</div>
      )}
      <input
        name={props.id}
        id={props.id}
        className={` ${props.className} w-full rounded-md border-2 border-gray-600 bg-gray-600 p-2 text-white focus:border-blue-500 focus:outline-none sm:text-sm`}
        placeholder={props.placeholder}
        type={props.type ?? "text"}
        autoFocus={props.autoFocus ?? false}
        onChange={props.onChange}
        value={props.value}
      />
      <span
        id={`${props.id}-helper-text`}
        className="pl-2 text-xs text-red-400"
      ></span>
    </div>
  );
};

export default TextField;
