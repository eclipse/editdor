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
import { getLocalStorage } from "../../services/localStorage";
import {
  isSuccessResponse,
  handleHttpRequest,
} from "../../services/thingsApiService";
import RequestSuccessful from "../base/RequestSuccessful";
import RequestFailed from "../base/RequestFailed";
import { fetchNorthboundTD } from "../../services/thingsApiService";
import SendTD from "../App/SendTD";

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
        const url = getLocalStorage("southbound");
        if (!url) return;

        const endpoint = `${url}${url.endsWith("/") ? "" : "/"}`;
        const encodedId = encodeURIComponent(currentTdId);

        const response = await handleHttpRequest(
          `${endpoint}${encodedId}`,
          "GET"
        );

        if ("data" in response && response.status === 200) {
          setIsUpdate(true);
          const responseNorthbound = await fetchNorthboundTD(currentTdId);
          context.updateNorthboundConnection({
            message: responseNorthbound.message,
            northboundTd: responseNorthbound.data ?? {},
          });
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

      const url = getLocalStorage("southbound");
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
            message: `TD updated successfully to ${endpoint}`,
            reason: "",
          });
          const responseNorthbound = await fetchNorthboundTD(currentTdId);
          context.updateNorthboundConnection({
            message: responseNorthbound.message,
            northboundTd: responseNorthbound.data ?? {},
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

      const url = getLocalStorage("southbound");
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
            message: `TD sent successfully to ${endpoint}`,
            reason: "",
          });
          const responseNorthbound = await fetchNorthboundTD(currentTdId);
          context.updateNorthboundConnection({
            message: responseNorthbound.message,
            northboundTd: responseNorthbound.data ?? {},
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
          onHandleEventLeftButton={close}
          leftButton={"Close"}
          title={"Send TD"}
          description={
            "The Thing Description will be sent to a Third-Party Service located at the endpoint configured in the Settings options under Southbound URL field. The proxied Thing will be interactable over HTTP in the left view."
          }
        >
          <SendTD
            isUpdate={isUpdate}
            requestSend={requestSend}
            requestUpdate={requestUpdate}
            onSend={handleSendTd}
            onUpdate={handleUpdateTd}
            currentTdId={currentTdId}
          />
        </DialogTemplate>,
        document.getElementById("modal-root") as HTMLElement
      );
    }

    return null;
  }
);

SendTDDialog.displayName = "SendTDDialog";
export default SendTDDialog;
