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
import React, {
  forwardRef,
  useContext,
  useEffect,
  useState,
  useImperativeHandle,
} from "react";
import ReactDOM from "react-dom";
import DialogTemplate from "./DialogTemplate";
import type { ThingDescription } from "wot-thing-description-types";
import ediTDorContext from "../../context/ediTDorContext";
import SpinnerTemplate from "./SpinnerTemplate";
import {
  getTargetUrl,
  handleHttpRequest,
  SOUTHBOUND,
} from "../../services/localStorage";
import { capitalizeFirstLetter } from "../../utils/strings";

export interface SendTDDialogRef {
  openModal: () => void;
  close: () => void;
}

const SendTDDialog = forwardRef<SendTDDialogRef>((_, ref) => {
  const [display, setDisplay] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [requestResult, setRequestResult] = useState<{
    success: boolean;
    message: string;
    reason: string;
  }>({
    success: false,
    message: "",
    reason: "",
  });
  const context = useContext(ediTDorContext);
  const td: ThingDescription = context.parsedTD;

  useImperativeHandle(ref, () => {
    return {
      openModal: () => open(),
      close: () => close(),
    };
  });

  const open = async () => {
    setDisplay(true);
    setIsLoading(true);
    setRequestResult({
      success: false,
      message: "",
      reason: "",
    });

    // *** testing purposes ***
    const TESTING_DELAY = 3000;
    if (TESTING_DELAY > 0) {
      console.log("Starting timeout for testing...");
      await new Promise((resolve) => setTimeout(resolve, TESTING_DELAY));
      console.log("Timeout complete, making request...");
    }
    //

    let url = getTargetUrl("southbound");
    if (!url.endsWith("/")) {
      url += "/";
    }
    const endpoint = `${url}${SOUTHBOUND}`;

    const response:
      | { data: any; headers: string; status: number }
      | { message: string; reason: string } = await handleHttpRequest(
      endpoint,
      "POST",
      JSON.stringify(td)
    );

    if ("data" in response) {
      setRequestResult({
        success: true,
        message: `TD sent successfully to ${endpoint}!`,
        reason: "",
      });
    } else {
      console.error("Failed to send TD:", response);

      setRequestResult({
        success: false,
        message: response.message,
        reason: response.reason,
      });
    }

    setIsLoading(false);
  };

  const close = () => {
    setDisplay(false);
    setIsLoading(false);
    setRequestResult({
      success: false,
      message: "",
      reason: "",
    });
  };

  const handleSubmit = () => {
    if (requestResult && !requestResult.success) {
      open();
    } else {
      close();
    }
  };
  const [dialogContent, setDialogContent] = useState<React.ReactNode>(null);

  useEffect(() => {
    if (isLoading) {
      setDialogContent(<SpinnerTemplate fullScreen={false} />);
      return;
    }

    if (requestResult?.success) {
      setDialogContent(
        <div className="flex flex-col items-center justify-center px-4 py-6">
          <div className="mb-4">
            <svg
              className="h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-green-700">
            Success!
          </h3>
          <p className="text-center text-gray-600">
            Your Thing Description has been sent successfully.
          </p>
        </div>
      );
      return;
    }

    if (!isLoading && requestResult) {
      const errorMessage =
        typeof requestResult.message === "string"
          ? requestResult.message
          : "An unknown error occurred";

      const errorReason =
        typeof requestResult.reason === "string" ? requestResult.reason : "";

      setDialogContent(
        <div className="flex flex-col items-center justify-center px-4 py-6">
          <div className="mb-4">
            <svg
              className="h-16 w-16 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="mb-3 text-lg font-semibold text-red-700">
            Request Failed
          </h3>
          <div className="w-full">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h4 className="mb-2 font-medium text-red-800">Error Message:</h4>
              <p className="mb-3 break-words text-sm text-red-700">
                {errorMessage}
              </p>
              {errorReason && (
                <>
                  <h4 className="mb-2 font-medium text-red-800">
                    Reason of failure:
                  </h4>
                  <p className="break-words text-sm text-red-600">
                    {capitalizeFirstLetter(errorReason)}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }
  }, [isLoading, requestResult]);

  if (display) {
    //const content = getDialogContent();

    return ReactDOM.createPortal(
      <DialogTemplate
        hasSubmit={requestResult?.success ? false : true}
        onCancel={close}
        cancelText={"Close"}
        submitText={"Resend"}
        onSubmit={handleSubmit}
        title={"Send TD"}
        description={
          "The Things Description will be sent to the server located at the endpoint " +
          getTargetUrl("southbound") +
          SOUTHBOUND
        }
      >
        <div>{dialogContent}</div>
      </DialogTemplate>,
      document.getElementById("modal-root") as HTMLElement
    );
  }

  return null;
});

SendTDDialog.displayName = "SendTDDialog";
export default SendTDDialog;
