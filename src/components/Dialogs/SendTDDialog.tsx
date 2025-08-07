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
import { forwardRef, useContext, useState, useImperativeHandle } from "react";
import ReactDOM from "react-dom";
import DialogTemplate from "./DialogTemplate";
import type { ThingDescription } from "wot-thing-description-types";
import ediTDorContext from "../../context/ediTDorContext";
import SpinnerTemplate from "./SpinnerTemplate";
import {
  getTargetUrl,
  isSuccessResponse,
  handleHttpRequest,
} from "../../services/localStorage";

import RequestSuccessful from "./base/RequestSuccessful";
import RequestFailed from "./base/RequestFailed";

export interface SendTDDialogRef {
  openModal: () => void;
  close: () => void;
}
interface SendTDDialogProps {
  currentTdId: string;
}

const SendTDDialog = forwardRef<SendTDDialogRef, SendTDDialogProps>(
  ({ currentTdId }, ref) => {
    const context = useContext(ediTDorContext);
    const td: ThingDescription = context.parsedTD;

    const [display, setDisplay] = useState<boolean>(false);
    const [isUpdate, setIsUpdate] = useState<boolean>(false);

    const [requestUpdate, setRequestUpdate] = useState<{
      isLoading: boolean;
      success: boolean;
      message: string;
      reason: string;
    }>({
      isLoading: false,
      success: false,
      message: "",
      reason: "",
    });

    const [requestSend, setRequestSend] = useState<{
      isLoading: boolean;
      success: boolean;
      message: string;
      reason: string;
    }>({
      isLoading: false,
      success: false,
      message: "",
      reason: "",
    });

    useImperativeHandle(ref, () => {
      return {
        openModal: () => open(),
        close: () => close(),
      };
    });

    const open = async () => {
      try {
        const url = getTargetUrl("southbound");
        if (!url) return;

        const endpoint = `${url}${url.endsWith("/") ? "" : "/"}`;
        const encodedId = encodeURIComponent(currentTdId);

        const response = await handleHttpRequest(
          `${endpoint}${encodedId}`,
          "GET"
        );

        if ("data" in response && response.status === 200) {
          setIsUpdate(true);
        } else {
          setIsUpdate(false);
        }
      } catch (error) {
        console.error("Error checking TD status:", error);
      }
      setDisplay(true);
    };

    const close = () => {
      setDisplay(false);
      setRequestUpdate({
        isLoading: false,
        success: false,
        message: "",
        reason: "",
      });
      setRequestSend({
        isLoading: false,
        success: false,
        message: "",
        reason: "",
      });
    };

    const handleUpdateTd = async () => {
      setRequestSend({
        isLoading: false,
        success: false,
        message: "",
        reason: "",
      });
      setRequestUpdate({
        ...requestUpdate,
        isLoading: true,
      });

      const url = getTargetUrl("southbound");
      const endpoint = `${url}/${currentTdId}`;

      const response = await handleHttpRequest(
        endpoint,
        "PUT",
        JSON.stringify(td)
      );

      if (isSuccessResponse(response)) {
        if (response.status === 204) {
          setRequestUpdate({
            ...requestUpdate,
            isLoading: false,
            success: true,
            message: `TD updated successfully to ${endpoint}!`,
            reason: "",
          });
        }
      } else {
        setRequestUpdate({
          ...requestUpdate,
          isLoading: false,
          success: false,
          message: response.message || "Failed to update TD",
          reason: response.reason || "",
        });
      }
    };

    const handleSendTd = async () => {
      setRequestSend({
        isLoading: true,
        success: false,
        message: "",
        reason: "",
      });

      const url = getTargetUrl("southbound");
      const endpoint = `${url}`;

      const response = await handleHttpRequest(
        endpoint,
        "POST",
        JSON.stringify(td)
      );

      if (isSuccessResponse(response)) {
        if (response.status === 201) {
          setRequestSend({
            ...requestSend,
            isLoading: false,
            success: true,
            message: `TD sent successfully to ${endpoint}!`,
            reason: "",
          });
          setIsUpdate(true);
        }
      } else {
        setRequestSend({
          ...requestSend,
          isLoading: false,
          success: false,
          message: response.message || "Failed to send TD",
          reason: response.reason || "",
        });
      }
    };

    const renderDialogContent = () => {
      if (requestUpdate.isLoading || requestSend.isLoading) {
        return <SpinnerTemplate fullScreen={false} />;
      }
      const getDisplayRequest = () => {
        if (isUpdate && requestUpdate.message) {
          return requestUpdate;
        }
        if (requestSend.message) {
          return requestSend;
        }
        return isUpdate ? requestUpdate : requestSend;
      };
      const displayRequest = getDisplayRequest();

      if (!displayRequest || displayRequest.message === "") {
        return <></>;
      }
      const operationType = displayRequest === requestSend ? "sent" : "updated";
      return displayRequest.success ? (
        <RequestSuccessful
          message={`Your Thing Description has been ${operationType} successfully.`}
        />
      ) : (
        <RequestFailed
          errorMessage={displayRequest.message}
          errorReason={displayRequest.reason}
        />
      );
    };

    if (display) {
      return ReactDOM.createPortal(
        <DialogTemplate
          hasSubmit={false}
          onCancel={close}
          cancelText={"Close"}
          title={"Send TD"}
          description={
            "The Thing Description will be sent to a Third-Party Service located at the endpoint configured in the Settings options under Southbound URL field. The proxied Thing will be interactable over HTTP in the left view."
          }
        >
          <div className="mb-2 rounded-md bg-black bg-opacity-80 p-2">
            <h1 className="mb-2 font-semibold">
              Current Configuration Details
            </h1>
            <div className="w-full overflow-hidden">
              <table className="w-full border-collapse">
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="w-1/3 py-2 pr-2 font-medium text-gray-400">
                      Endpoint:
                    </td>
                    <td className="break-all py-2 text-gray-400">
                      {getTargetUrl("southbound") || "(No endpoint configured)"}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/3 py-2 pr-2 font-medium text-gray-400">
                      TD ID:
                    </td>
                    <td className="break-all py-2 text-gray-400">
                      {currentTdId || "(No ID available)"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-2 rounded-md bg-black bg-opacity-80 p-2">
            <h1 className="mb-2 font-semibold">Operation Details</h1>
            <div className="px-4 py-2">
              <div className="flex items-center">
                <span className="mr-2 font-medium text-gray-400">Action:</span>
                <span className="rounded bg-green-900 px-2 py-1 text-sm font-medium text-green-200">
                  {isUpdate ? "Update Existing TD" : "Send New TD"}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-400">
                {isUpdate
                  ? "You are updating an existing Thing Description that was previously sent to the server."
                  : "You are sending a new Thing Description to the server for the first time."}
              </p>
            </div>
          </div>

          <div className="rounded-md bg-black bg-opacity-80 p-2">
            <h1 className="font-bold">Result:</h1>
            <div className="px-4">
              <h2 className="py-2 text-justify text-gray-400">
                {requestSend.message
                  ? requestSend.message
                  : isUpdate
                    ? requestUpdate.message || "No update request made yet."
                    : "No send request made yet."}
              </h2>

              <div className="my-4 flex justify-end">
                {isUpdate ? (
                  <button
                    onClick={handleUpdateTd}
                    className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    disabled={requestUpdate.isLoading}
                  >
                    Update TD
                  </button>
                ) : (
                  <button
                    onClick={handleSendTd}
                    className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    disabled={requestSend.isLoading}
                  >
                    Send TD
                  </button>
                )}
              </div>
              <div>{renderDialogContent()}</div>
            </div>
          </div>
        </DialogTemplate>,
        document.getElementById("modal-root") as HTMLElement
      );
    }

    return null;
  }
);

SendTDDialog.displayName = "SendTDDialog";
export default SendTDDialog;
