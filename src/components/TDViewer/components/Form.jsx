/********************************************************************************
 * Copyright (c) 2018 - 2024 Contributors to the Eclipse Foundation
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
import { Core, Http } from "@node-wot/browser-bundle";
import React, { useContext, useState } from "react";
import { ChevronUp, PlusCircle, Trash2 } from "react-feather";
import ediTDorContext from "../../../context/ediTDorContext";

const servient = new Core.Servient();
servient.addClientFactory(new Http.HttpClientFactory());
console.log("init servient");

const formConfigurations = {
  readproperty: {
    color: "Green",
    title: "Read",
    level: "properties",
    callback: readProperty,
  },
  writeproperty: {
    color: "Blue",
    title: "Write",
    level: "properties",
    callback: writeProperty,
  },
  observeproperty: {
    color: "Orange",
    title: "Observe",
    level: "properties",
    callback: null,
  },
  unobserveproperty: {
    color: "Red",
    title: "Unobserve",
    level: "properties",
    callback: null,
  },
  invokeaction: {
    color: "Orange",
    title: "Invoke",
    level: "actions",
    callback: null,
  },
  subscribeevent: {
    color: "Orange",
    title: "Subscribe",
    level: "events",
    callback: null,
  },
  unsubscribeevent: {
    color: "Red",
    title: "Unsubscribe",
    level: "events",
    callback: null,
  },
  readmultipleproperties: {
    color: "Green",
    title: "Read Multiple",
    level: "thing",
    callback: null,
  },
  readallproperties: {
    color: "Green",
    title: "Read All",
    level: "thing",
    callback: null,
  },
  writemultipleproperties: {
    color: "Blue",
    title: "Write Multiple",
    level: "thing",
    callback: null,
  },
  writeallproperties: {
    color: "Blue",
    title: "Write All",
    level: "thing",
    callback: null,
  },
  observeallproperties: {
    color: "Orange",
    title: "Observe All",
    level: "thing",
    callback: null,
  },
  unobserveallproperties: {
    color: "Red",
    title: "Unobserve All",
    level: "thing",
    callback: null,
  },
};

/**
 * Description of the function
 * @name InteractionFunction
 * @function
 * @param {Object} td The actual Thing Description
 * @param {String} propertyName The name of the Property
 * @param {any} content What should be written in case of e.g. a writeproperty call
 */

/** @type {InteractionFunction} */
async function readProperty(td, propertyName, _) {
  try {
    const thingFactory = await servient.start();
    const thing = await thingFactory.consume(td);

    const res = await thing.readProperty(propertyName);
    // always return the result even if the data schema doesn't fit
    res.ignoreValidation = true;
    const val = await res.value();

    return { result: JSON.stringify(val, null, 2), err: null };
  } catch (e) {
    console.debug(e);
    return { result: "", err: e };
  }
}

async function writeProperty(td, propertyName, content) {
  try {
    const thingFactory = await servient.start();
    const thing = await thingFactory.consume(td);

    // no return value - only exception on error
    await thing.writeProperty(propertyName, content);

    return {
      result: `Successfully wrote ${content} to '${propertyName}'.`,
      err: null,
    };
  } catch (e) {
    console.debug(e);
    return { result: "", err: e };
  }
}

export default function Form(props) {
  props.form.propName = props.propName;

  const fc = formConfigurations[props.form.op];
  if (!fc) {
    return (
      <UndefinedForm
        level={typeToJSONKey(props.interactionType)}
        form={props.form}
      />
    );
  }

  return formComponent(props.form.op, props.form, fc.callback);
}

const typeToJSONKey = (type) => {
  const typeToJSONKey = {
    action: "actions",
    property: "properties",
    event: "events",
    thing: "thing",
  };

  return typeToJSONKey[type];
};

/**
 *
 * @param {"thing" | "properties" | "actions" | "events"} formType
 * @param {{href:string; op:string|[]string; propName:string; actualIndex:number;}} form
 * @param {InteractionFunction} interactionFunction
 * @returns
 */
function formComponent(formType, form, interactionFunction) {
  const context = useContext(ediTDorContext);
  const [writeContent, setWriteContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [val, setVal] = useState(null);
  const [err, setErr] = useState(null);

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

  const callInteractionFunction = async () => {
    if (!interactionFunction) {
      return;
    }

    setIsLoading(true);
    const res = await interactionFunction(
      context.parsedTD,
      form.propName,
      writeContent
    );
    if (res.err !== null) {
      setErr(res.err.message);
      setVal(null);
    } else {
      setErr(null);
      setVal(res.result);
    }

    setIsLoading(false);
    setWriteContent("");
  };

  return (
    <>
      <div
        className={`flex min-h-12 w-full items-stretch bg-opacity-75 bg-form${fc.color} mt-2 ${isLoading || val !== null || err != null || form.op === "writeproperty" ? "rounded-t-md" : "rounded-md"} border-2 pl-4 border-form${fc.color}`}
      >
        {interactionFunction && (
          <button onClick={callInteractionFunction}>{label}</button>
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            callInteractionFunction();
          }}
        >
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
}
export function AddFormElement(props) {
  return (
    <button
      className="border-formBlue bg-formBlue flex min-h-10 w-full items-stretch rounded-md border-2 bg-opacity-75 pl-4"
      onClick={props.onClick}
    >
      <div className="flex items-center justify-center">
        <PlusCircle color="white" size="20" />
        <div className={`pl-2 text-center text-white`}>
          Click to add Form...
        </div>
      </div>
    </button>
  );
}

export function UndefinedForm(props) {
  const context = useContext(ediTDorContext);

  return (
    <div className="flex min-h-10 w-full items-stretch rounded-md border-2 border-gray-300 bg-gray-300 bg-opacity-75 pl-4">
      <div className="flex h-6 min-w-20 justify-center place-self-center rounded-md bg-white">
        <div
          className={`place-self-center px-4 text-center text-xs text-black`}
        >
          Undefined
        </div>
      </div>
      <div className="flex-grow place-self-center overflow-hidden pl-3 text-white">
        {props.form.href}
      </div>
      <button
        className="flex w-10 items-center justify-center bg-gray-300"
        onClick={() =>
          context.removeForm(
            props.level,
            props.form.propName,
            props.form,
            props.form.actualIndex
          )
        }
      >
        <Trash2 size={16} color="black" />
      </button>
    </div>
  );
}
