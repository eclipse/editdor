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
interface FormCheckboxProps {
  name: string;
}

const FormCheckbox: React.FC<FormCheckboxProps> = ({ name }) => {
  const id = `form-${name}`;
  const isInvoke = name === "invokeaction";

  return (
    <div className="form-checkbox pl-2">
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
};
export default FormCheckbox;
