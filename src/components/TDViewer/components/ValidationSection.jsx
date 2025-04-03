import { useContext, useEffect, useState } from "react";
import ediTDorContext from "../../../context/ediTDorContext";
import { ImCheckmark, ImCross } from "react-icons/im";

export default function ValidationView(props) {
  const context = useContext(ediTDorContext);

  /** @type {ReturnType<typeof useState<import("../../../models").ValidationState>>} */
  const [jsonValidation, setJsonValidation] = useState(undefined);
  /** @type {ReturnType<typeof useState<string | null>} */
  const [jsonValidationError, setJsonValidationError] = useState(undefined);

  /** @type {ReturnType<typeof useState<import("../../../models").ValidationState>>} */
  const [jsonSchemaValidation, setJsonSchemaValidation] = useState(undefined);
  /** @type {ReturnType<typeof useState<string | null>} */
  const [jsonSchemaValidationError, setJsonSchemaValidationError] = useState(undefined);

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

      console.debug("JSON validation error", validationMessage.validationErrors.json);
      console.debug("JSON Schema validation error", validationMessage.validationErrors.schema);
    }
  }, [context, jsonValidationError, jsonSchemaValidationError]);

  return (
    <div className="container bg-gray-600 text-white rounded-md p-4 mb-4">
      <div className="flex items-center">
        <h2 className="mr-2">JSON Validation</h2>
        {jsonValidation === "passed" && <ImCheckmark />}
        {jsonValidation === "failed" && <ImCross />}
      </div>

      {jsonValidationError && (
        <div className="flex min-h-[2.5rem] w-full bg-formRed rounded-md px-4 mt-2 bg-opacity-75 border-2 border-formRed mb-4">
          <div className="flex h-6 w-16 bg-white rounded-md place-self-center justify-center">
            <div className="text-formRed place-self-center text-center text-xs px-4">
              Error
            </div>
          </div>
          <div className=" place-self-center pl-3 text-base overflow-hidden">
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
        <div className="flex min-h-[2.5rem] w-full bg-formRed rounded-md px-4 mt-2 bg-opacity-75 border-2 border-formRed">
          <div className="flex h-6 w-16 bg-white rounded-md place-self-center justify-center">
            <div className="text-formRed place-self-center text-center text-xs px-4">
              Error
            </div>
          </div>
          <div className=" place-self-center pl-3 text-base overflow-hidden">
            {jsonSchemaValidationError}
          </div>
        </div>
      )}
    </div>
  );
}
