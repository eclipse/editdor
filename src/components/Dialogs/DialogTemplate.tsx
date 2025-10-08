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
  leftButton?: string;
  onHandleEventLeftButton?: () => void;
  rightButton?: string;
  onHandleEventRightButton?: () => void;
  hasSubmit?: boolean;
  className?: string;
  auxiliaryButton?: boolean;
  onHandleEventAuxiliaryButton?: () => void;
}

const DialogTemplate: React.FC<DialogTemplateProps> = (props) => {
  const title = props.title ?? "Default Title";
  const description =
    props.description ?? "Default description, please override.";
  const children = props.children ?? <></>;

  const leftText = props.leftButton ?? "Cancel";
  const onHandleEventLeftButton = props.onHandleEventLeftButton ?? (() => {});

  const rightText = props.rightButton ?? "Submit";
  const onHandleEventRightButton = props.onHandleEventRightButton ?? (() => {});
  const auxiliaryButton = props.auxiliaryButton ?? false;
  const onHandleEventAuxiliaryButton =
    props.onHandleEventAuxiliaryButton ?? (() => {});
  const hasSubmit = props.hasSubmit ?? true;
  const className = props.className ?? "lg:w-[40%]";

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
        <div
          className={`flex max-h-[95%] w-[80%] flex-col justify-start rounded-xl bg-gray-500 p-4 shadow-xl ${className}`}
        >
          <div className="flex flex-row items-center justify-start">
            <h1 className="flex-grow pl-2 text-2xl font-bold">{title}</h1>
          </div>

          <h2 className={`py-2 pl-2 text-gray-400`}>{description}</h2>
          <div className="overflow-auto p-2">{children}</div>
          <div className="flex justify-end p-2 pt-4">
            {rightText !== "OK" && (
              <BaseButton
                id="leftButton"
                onClick={() => onHandleEventLeftButton()}
                variant="primary"
                type="button"
                className="ml-2"
              >
                {leftText}
              </BaseButton>
            )}
            {auxiliaryButton && (
              <BaseButton
                id="closeButton"
                onClick={() => onHandleEventAuxiliaryButton()}
                variant="primary"
                type="button"
                className="ml-2 flex"
              >
                Close
              </BaseButton>
            )}

            {hasSubmit && (
              <BaseButton
                id="rightButton"
                onClick={() => onHandleEventRightButton()}
                variant="primary"
                type="button"
                className="ml-2 flex"
              >
                {rightText}
              </BaseButton>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DialogTemplate;
