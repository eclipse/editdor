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
import { capitalizeFirstLetter } from "../../utils/strings";
interface IRequestFailed {
  errorMessage: string;
  errorReason: string;
}
const RequestFailed: React.FC<IRequestFailed> = ({
  errorMessage,
  errorReason,
}) => {
  return (
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
};

export default RequestFailed;
