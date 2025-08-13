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
interface IRequestSuccessful {
  message: string;
}

const RequestSuccessful: React.FC<IRequestSuccessful> = ({ message }) => {
  return (
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
      <h3 className="mb-2 text-lg font-semibold text-green-700">Success!</h3>
      <p className="text-center text-gray-600">{message}</p>
    </div>
  );
};

export default RequestSuccessful;
