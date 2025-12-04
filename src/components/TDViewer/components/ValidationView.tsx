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

import { useContext, useMemo } from "react";
import ediTDorContext from "../../../context/ediTDorContext";
import { ImCheckmark, ImCross } from "react-icons/im";
import { RotateCcw, RotateCw } from "react-feather";
import BaseButton from "../base/BaseButton";

type ValidationState = "warning" | "passed" | "failed" | null;

type ValidationViewProps = {
  onUndo: () => void;
  onRedo: () => void;
};

const GLOBAL_ERROR_PARSING_JSON =
  "JSON validation failed: Parsed object is not valid JSON.";
const DEFAULT_ERROR_SCHEMA =
  "JSON Schema validation failed: Unknown schema validation error.";

const ValidationView: React.FC<ValidationViewProps> = ({
  onUndo: handleUndo,
  onRedo: handleRedo,
}) => {
  const context = useContext(ediTDorContext);

  // Object json errors
  const jsonValidation = useMemo<ValidationState>(() => {
    let r: ValidationState = null;
    try {
      r =
        context.validationMessage.report.json === "passed" ||
        context.validationMessage.report.json === "warning" ||
        context.validationMessage.report.jsonld === "passed" ||
        context.validationMessage.report.jsonld === "warning"
          ? "passed"
          : "failed";
    } catch (e) {
      return "failed";
    }
    return r;
  }, [context]);

  // Schenas validation
  const jsonSchemaValidation: ValidationState = useMemo<ValidationState>(() => {
    let s: ValidationState = null;
    try {
      s = context.validationMessage.report.schema;
    } catch (e) {
      return "failed";
    }
    return s;
  }, [context]);

  // Additional report validation
  const reportValidation = useMemo<
    (keyof typeof context.validationMessage.details)[]
  >(() => {
    try {
      if (typeof context.validationMessage.details != "object") {
        return [];
      }
      const details = context.validationMessage.details;

      return (Object.keys(details) as (keyof typeof details)[]).filter(
        (key) => details[key] === "failed"
      );
    } catch (e) {
      return [];
    }
  }, [context]);

  const reportValidationError = useMemo<string[]>(() => {
    if (reportValidation.length === 0) {
      return [];
    }
    try {
      const comments = context.validationMessage.detailComments;
      return reportValidation
        .map((key) => comments[key])
        .filter((v): v is string => typeof v === "string");
    } catch (e) {
      return [];
    }
  }, [reportValidation]);

  return (
    <>
      <div className="col-span-4 mb-4 flex justify-end gap-2">
        <BaseButton
          onClick={handleUndo}
          variant="primary"
          type="button"
          className="flex h-8 w-40 items-center justify-center px-3 py-1"
        >
          <RotateCcw size={16} strokeWidth={3} className="mr-2" />
          <span className="font-bold">Undo</span>
        </BaseButton>
        <BaseButton
          onClick={handleRedo}
          variant="primary"
          type="button"
          className="flex h-8 w-40 items-center justify-center px-3 py-1"
        >
          <span className="mr-2 font-bold">Redo</span>
          <RotateCw size={16} strokeWidth={3} />
        </BaseButton>
      </div>

      <div className="mb-4 w-full rounded-md bg-gray-600 p-4 text-white">
        <div className="flex items-center">
          <h2 className="mr-2">JSON Validation</h2>
          {jsonValidation === "passed" && <ImCheckmark color="#32CD32" />}
          {jsonValidation === "failed" && <ImCross color="Red" />}
        </div>

        {jsonValidation === "failed" && (
          <div className="bg-formRed border-formRed mb-4 mt-2 flex min-h-[2.5rem] w-full rounded-md border-2 bg-opacity-75 px-4">
            <div className="flex h-6 w-16 justify-center self-center rounded-md bg-white">
              <div className="place-self-center px-4 text-center text-xs text-black">
                Error
              </div>
            </div>
            <div className="place-self-center overflow-hidden pl-3 text-base">
              {context.validationMessage?.validationErrors?.json ??
                GLOBAL_ERROR_PARSING_JSON}
            </div>
          </div>
        )}

        <div className="flex items-center">
          <h2 className="mr-2">JSON Schema Validation </h2>
          {jsonSchemaValidation === "passed" && <ImCheckmark color="#32CD32" />}
          {jsonSchemaValidation === "failed" && <ImCross color="Red" />}
        </div>

        {jsonSchemaValidation === "failed" && (
          <div className="bg-formRed border-formRed mt-2 flex min-h-[2.5rem] w-full rounded-md border-2 bg-opacity-75 px-4">
            <div className="flex h-6 w-16 justify-center self-center rounded-md bg-white">
              <div className="place-self-center px-4 text-center text-xs text-black">
                Error
              </div>
            </div>
            <div className="place-self-center overflow-hidden pl-3 text-base">
              {context.validationMessage?.validationErrors?.schema ??
                DEFAULT_ERROR_SCHEMA}
            </div>
          </div>
        )}
        <div className="flex items-center">
          <h2 className="mr-2">Additional Checks </h2>
          {reportValidation.length === 0 && <ImCheckmark color="#32CD32" />}
          {reportValidation.length > 0 && <ImCross color="Red" />}
        </div>
        {reportValidationError && reportValidationError.length > 0 && (
          <div className="bg-formRed border-formRed mt-2 flex min-h-[2.5rem] w-full rounded-md border-2 bg-opacity-75 px-4">
            <div className="flex h-6 w-16 justify-center self-center rounded-md bg-white">
              <div className="place-self-center px-4 text-center text-xs text-black">
                Error
              </div>
            </div>
            <div className="place-self-center overflow-hidden pl-3 text-base">
              {reportValidationError.join(", ")}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ValidationView;
