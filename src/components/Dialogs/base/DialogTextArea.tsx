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
interface ITextAreaProps {
  id: string;
  label: string;
  placeholder?: string;
}

const DialogTextArea: React.FC<ITextAreaProps> = (props) => {
  return (
    <>
      <label
        htmlFor={props.id}
        className="pl-2 text-sm font-medium text-gray-400"
      >
        {props.label}:
      </label>
      <textarea
        id={props.id}
        rows={5}
        className="w-full appearance-none rounded border-2 border-gray-600 bg-gray-600 p-2 leading-tight text-white focus:border-blue-500 focus:outline-none sm:text-sm"
        placeholder={props.placeholder}
      />
    </>
  );
};

export default DialogTextArea;
