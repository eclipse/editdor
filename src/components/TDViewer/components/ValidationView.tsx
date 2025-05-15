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

import { useContext, useEffect, useState } from "react";
import ediTDorContext from "../../../context/ediTDorContext";
import { ImCheckmark, ImCross } from "react-icons/im";
import { RotateCcw, RotateCw } from "react-feather";

type ValidationState = "passed" | "failed" | undefined;

type ValidationViewProps = {
  onUndo: () => void;
  onRedo: () => void;
};

const ValidationView: React.FC<ValidationViewProps> = ({ onUndo, onRedo }) => {
  const context = useContext(ediTDorContext);

  const [jsonValidation, setJsonValidation] =
    useState<ValidationState>(undefined);
  const [jsonValidationError, setJsonValidationError] = useState<
    string | null | undefined
  >(undefined);

  const [jsonSchemaValidation, setJsonSchemaValidation] =
    useState<ValidationState>(undefined);
  const [jsonSchemaValidationError, setJsonSchemaValidationError] = useState<
    string | null | undefined
  >(undefined);

  useEffect(() => {
    const validationMessage = context.validationMessage;
    if (!validationMessage) {
      return;
    }

    if (validationMessage.report) {
      setJsonValidation(validationMessage.report.json);
      setJsonSchemaValidation(validationMessage.report.schema);
    }

    if (!validationMessage.validationErrors) {
      setJsonValidationError(undefined);
      setJsonSchemaValidationError(undefined);
      return;
    }

    if (validationMessage.validationErrors) {
      setJsonValidationError(validationMessage.validationErrors.json);
      setJsonSchemaValidationError(validationMessage.validationErrors.schema);

      console.debug(
        "JSON validation error",
        validationMessage.validationErrors.json
      );
      console.debug(
        "JSON Schema validation error",
        validationMessage.validationErrors.schema
      );
    }
  }, [context, jsonValidationError, jsonSchemaValidationError]);

  return (
    <>
      <div className="col-span-4 mb-4 flex justify-end gap-2">
        <button
          className="flex h-8 w-40 items-center justify-center rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
          onClick={onUndo}
        >
          <RotateCcw size={16} strokeWidth={3} className="mr-2"></RotateCcw>
          <span className="font-bold">Undo</span>
        </button>
        <button
          className="flex h-8 w-40 items-center justify-center rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
          onClick={onRedo}
        >
          <span className="mr-2 font-bold">Redo</span>
          <RotateCw size={16} strokeWidth={3}></RotateCw>
        </button>
      </div>

      <div className="mb-4 w-full rounded-md bg-gray-600 p-4 text-white">
        <div className="flex items-center">
          <h2 className="mr-2">JSON Validation</h2>
          {jsonValidation === "passed" && <ImCheckmark />}
          {jsonValidation === "failed" && <ImCross />}
        </div>

        {jsonValidationError && (
          <div className="bg-formRed border-formRed mb-4 mt-2 flex min-h-[2.5rem] w-full rounded-md border-2 bg-opacity-75 px-4">
            <div className="flex h-6 w-16 justify-center self-center rounded-md bg-white">
              <div className="text-formRed place-self-center px-4 text-center text-xs">
                Error
              </div>
            </div>
            <div className="place-self-center overflow-hidden pl-3 text-base">
              {jsonValidationError}
            </div>
          </div>
        )}

        <div className="flex items-center">
          <h2 className="mr-2">JSON Schema Validation </h2>
          {jsonSchemaValidation === "passed" && <ImCheckmark />}
          {jsonSchemaValidation === "failed" && <ImCross />}
        </div>

        {jsonSchemaValidationError && (
          <div className="bg-formRed border-formRed mt-2 flex min-h-[2.5rem] w-full rounded-md border-2 bg-opacity-75 px-4">
            <div className="flex h-6 w-16 justify-center self-center rounded-md bg-white">
              <div className="text-formRed place-self-center px-4 text-center text-xs">
                Error
              </div>
            </div>
            <div className="place-self-center overflow-hidden pl-3 text-base">
              {jsonSchemaValidationError}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ValidationView;
