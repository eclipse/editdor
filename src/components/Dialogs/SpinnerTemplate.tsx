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

import React from "react";
import ReactDOM from "react-dom";

const SpinnerTemplate = (_) => {
  return ReactDOM.createPortal(
    <div className="bg-transparent-400 absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center text-white">
      <div className="bg-transparent-400 flex max-h-screen w-1/3 flex-col items-center justify-center p-4">
        <div className="justify-center overflow-hidden p-2">
          {showSpinner()}
        </div>
      </div>
    </div>,
    document.getElementById("modal-root") as HTMLElement
  );
};

const showSpinner = () => {
  return (
    <div className="spinner-container">
      <div className="loading-spinner"></div>
    </div>
  );
};

export default SpinnerTemplate;
