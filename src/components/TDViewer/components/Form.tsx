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
import FormDetails from "../base/FormDetails";
import UndefinedForm from "../base/UndefinedForm";
import { formConfigurations } from "../../../services/form";
import type { IFormProps, FormOpKeys } from "../../../types/td.d";

const typeToJSONKey = (type: string): string => {
  const typeToJSONKey: Record<string, string> = {
    action: "actions",
    property: "properties",
    event: "events",
    thing: "thing",
  };

  return typeToJSONKey[type];
};

interface IFormComponentProps {
  form: IFormProps;
  propName: string;
  interactionType: "thing" | "properties" | "actions" | "events";
}

const Form: React.FC<any> = (props: IFormComponentProps): JSX.Element => {
  props.form.propName = props.propName;

  const fc = formConfigurations[props.form.op as string];
  if (!fc) {
    return (
      <UndefinedForm
        level={typeToJSONKey(props.interactionType)}
        form={props.form}
      />
    );
  }

  return (
    <>
      <FormDetails
        formType={props.form.op as FormOpKeys}
        form={props.form}
        interactionFunction={fc.callback}
      />
    </>
  );
};

export default Form;
