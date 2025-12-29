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
import React from "react";

type RequestState = {
  isLoading: boolean;
  success: boolean;
  message: string;
  reason: string;
};

interface CreateTdProps {
  isUpdate: boolean;
  requestSend: RequestState;
  requestUpdate: RequestState;
  onSend: () => void;
  onUpdate: () => void;
  currentTdId: string;
}

const RequestSuccessful: React.FC<{ message: string }> = ({ message }) => (
  <div className="rounded-md border border-green-700 bg-green-900/40 p-3 text-green-200">
    {message}
  </div>
);

const RequestFailed: React.FC<{
  errorMessage: string;
  errorReason: string;
}> = ({ errorMessage, errorReason }) => (
  <div className="rounded-md border border-red-700 bg-red-900/40 p-3 text-red-200">
    <div className="font-semibold">Request failed</div>
    <div className="mt-1">{errorMessage}</div>
    {errorReason && (
      <div className="mt-1 text-red-300">Reason: {errorReason}</div>
    )}
  </div>
);

const SpinnerTemplate: React.FC<{ fullScreen?: boolean }> = ({
  fullScreen,
}) => (
  <div
    className={`flex items-center justify-center ${fullScreen ? "min-h-[200px]" : ""}`}
  >
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
  </div>
);

const CreateTd: React.FC<CreateTdProps> = ({
  isUpdate,
  requestSend,
  requestUpdate,
  onSend,
  onUpdate,
}) => {
  const renderDialogContent = () => {
    const isLoading = requestUpdate.isLoading || requestSend.isLoading;
    if (isLoading) return <SpinnerTemplate fullScreen={false} />;

    const displayRequest =
      isUpdate && requestUpdate.message
        ? requestUpdate
        : requestSend.message
          ? requestSend
          : isUpdate
            ? requestUpdate
            : requestSend;

    if (!displayRequest || displayRequest.message === "") return <></>;

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

  return (
    <div className="rounded-md bg-black bg-opacity-80 p-2">
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
                onClick={onUpdate}
                className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                disabled={requestUpdate.isLoading}
              >
                Update TD
              </button>
            ) : (
              <button
                onClick={onSend}
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
    </div>
  );
};

export default CreateTd;
