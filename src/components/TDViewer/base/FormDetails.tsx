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
import React, { useContext, useState } from "react";
import { ChevronUp, Trash2 } from "react-feather";
import ediTDorContext from "../../../context/ediTDorContext";
import { formConfigurations } from "../../../services/form";
import type {
  ThirdPartyCallback,
  ServiantCallback,
  IFormProps,
  OpKeys,
} from "../../../types/form";
import { getLocalStorage } from "../../../services/localStorage";

interface IFormDetailsProps {
  operationType: OpKeys;
  form: IFormProps;
  interactionFunction: ServiantCallback | ThirdPartyCallback | null;
  usesNorthboundConnection: boolean;
}

const FormDetails: React.FC<IFormDetailsProps> = ({
  operationType: formType,
  form,
  interactionFunction,
  usesNorthboundConnection,
}) => {
  const context = useContext(ediTDorContext);
  const [writeContent, setWriteContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [val, setVal] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const fc = formConfigurations[formType];

  if (!fc) {
    return <></>;
  }

  const label = (
    <div className="flex h-8 min-w-20 justify-center place-self-center rounded-md bg-white">
      <div
        className={`text-form${fc.color} place-self-center px-4 text-center`}
      >
        {fc.title}
      </div>
    </div>
  );

  const handleCallInteractionFunction = async () => {
    if (!interactionFunction) {
      return;
    }

    setIsLoading(true);

    try {
      let res;

      if (usesNorthboundConnection) {
        const thirdPartyCallback = interactionFunction as ThirdPartyCallback;

        const baseUrl = context.northboundConnection?.northboundTd?.base || "";
        const href = form.href;
        const valuePath = getLocalStorage("valuePath");

        res = await thirdPartyCallback(baseUrl, href, valuePath);
      } else {
        const serviantCallback = interactionFunction as ServiantCallback;

        res = await serviantCallback(
          context.parsedTD,
          form.propName,
          writeContent
        );
      }

      if (res.err !== null) {
        setErr(res.err.message);
        setVal(null);
      } else {
        setErr(null);
        setVal(res.result);
      }
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Unknown error occurred");
      setVal(null);
    } finally {
      setIsLoading(false);
      setWriteContent("");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCallInteractionFunction();
  };

  return (
    <>
      <div
        className={`flex min-h-12 w-full items-stretch bg-opacity-75 bg-form${fc.color} mt-2 ${isLoading || val !== null || err != null || form.op === "writeproperty" ? "rounded-t-md" : "rounded-md"} border-2 pl-4 border-form${fc.color}`}
      >
        {interactionFunction && (
          <button onClick={handleCallInteractionFunction}>{label}</button>
        )}
        {!interactionFunction && <div className="flex">{label}</div>}

        <div className="flex-grow place-self-center overflow-hidden pl-3 text-base text-white">
          {form.href}
        </div>

        {(err !== null || val !== null) && (
          <button
            className={`flex min-w-10 items-center justify-center border-r-2 border-form${fc.color} bg-form${fc.color}`}
            onClick={() => {
              setErr(null);
              setVal(null);
            }}
          >
            <ChevronUp size={16} color="white" />
          </button>
        )}
        <button
          className={`flex min-w-10 items-center justify-center bg-form${fc.color}`}
          onClick={() =>
            context.removeForm(fc.level, form.propName, form, form.actualIndex)
          }
        >
          <Trash2 size={16} color="white" />
        </button>
      </div>

      {form.op === "writeproperty" && (
        <form onSubmit={handleFormSubmit}>
          <input
            type="text"
            placeholder="Input a value and hit write..."
            value={writeContent}
            onChange={(e) => setWriteContent(e.target.value)}
            className={`flex w-full overflow-auto bg-white px-4 py-2 ${val !== null || err != null ? "border-b-2 border-gray-300" : "rounded-b-md"}`}
          />
        </form>
      )}

      {/* error or value that the interaction function returned */}
      {isLoading !== false && (
        <pre className="flex overflow-auto rounded-b-md bg-white">
          <div className={`p-4 text-black`}>Waiting for a response...</div>
        </pre>
      )}
      {err !== null && (
        <pre className="flex overflow-auto rounded-b-md bg-white">
          <div className={`text-formRed p-4`}>Error: {err}</div>
        </pre>
      )}
      {val !== null && (
        <pre className="flex overflow-auto rounded-b-md bg-white">
          <div className={`p-4 text-black`}>{val}</div>
        </pre>
      )}
    </>
  );
};
export default FormDetails;
