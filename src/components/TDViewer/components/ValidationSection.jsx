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
  const [jsonSchemaValidationError, setJsonSchemaValidationError] =
    useState(undefined);

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
    <div className="container mb-4 rounded-md bg-gray-600 p-4 text-white">
      <div className="flex items-center">
        <h2 className="mr-2">JSON Validation</h2>
        {jsonValidation === "passed" && <ImCheckmark />}
        {jsonValidation === "failed" && <ImCross />}
      </div>

      {jsonValidationError && (
        <div className="bg-formRed border-formRed mb-4 mt-2 flex min-h-[2.5rem] w-full rounded-md border-2 bg-opacity-75 px-4">
          <div className="flex h-6 w-16 justify-center place-self-center rounded-md bg-white">
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
          <div className="flex h-6 w-16 justify-center place-self-center rounded-md bg-white">
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
  );
}
