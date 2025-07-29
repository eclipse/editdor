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
import React, { ReactNode } from "react";
import BaseButton from "../TDViewer/base/BaseButton";

interface DialogTemplateProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  cancelText?: string;
  onCancel?: () => void;
  submitText?: string;
  onSubmit?: () => void;
  hasSubmit?: boolean;
  className?: string;
}

const DialogTemplate: React.FC<DialogTemplateProps> = (props) => {
  const title = props.title ?? "Default Title";
  const description =
    props.description ?? "Default description, please override.";
  const children = props.children ?? <></>;

  const cancelText = props.cancelText ?? "Cancel";
  const onCancel = props.onCancel ?? (() => {});

  const submitText = props.submitText ?? "Submit";
  const onSubmit = props.onSubmit ?? (() => {});
  const hasSubmit = props.hasSubmit ?? true;

  let keysDown = {};
  window.onkeydown = function (e: KeyboardEvent) {
    keysDown[e.key] = true;
    if (keysDown["Control"] && keysDown["Enter"]) {
      document.getElementById("submitButton")?.click();
    } else if (keysDown["Escape"]) {
      document.getElementById("cancelButton")?.click();
    }
  };

  window.onkeyup = function (e: KeyboardEvent) {
    keysDown[e.key] = false;
  };

  return (
    <>
      <div className="absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center bg-black bg-opacity-80 text-white">
        <div className="flex max-h-[95%] w-[80%] flex-col justify-start rounded-xl bg-gray-500 p-4 shadow-xl lg:w-[40%]">
          <div className="flex flex-row items-center justify-start">
            <h1 className="flex-grow pl-2 text-2xl font-bold">{title}</h1>
          </div>
          <h2 className={`py-2 pl-2 text-gray-400 ${props.className}`}>
            {description}
          </h2>
          <div className="overflow-auto p-2">{children}</div>
          <div className="flex justify-end p-2 pt-4">
            {submitText !== "OK" && (
              <BaseButton
                id="cancelButton"
                onClick={() => onCancel()}
                variant="primary"
                type="button"
                className="mr-1"
              >
                {cancelText}
              </BaseButton>
            )}
            {hasSubmit && (
              <BaseButton
                id="submitButton"
                onClick={() => onSubmit()}
                variant="primary"
                type="button"
                className="flex"
              >
                {submitText}
              </BaseButton>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DialogTemplate;
