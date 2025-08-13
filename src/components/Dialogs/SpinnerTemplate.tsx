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

interface SpinnerTemplateProps {
  fullScreen?: boolean; // overlay ->true, inline component -> false
  className?: string;
  show?: boolean;
}

const SpinnerTemplate: React.FC<SpinnerTemplateProps> = ({
  fullScreen = true,
  className = "",
  show = true,
}) => {
  if (!show) {
    return null;
  }

  const spinnerElement = <Spinner className={className} />;

  if (fullScreen) {
    return ReactDOM.createPortal(
      <div className="bg-transparent-400 absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center text-white">
        <div className="bg-transparent-400 flex max-h-screen w-1/3 flex-col items-center justify-center p-4">
          <div className="justify-center overflow-hidden p-2">
            {spinnerElement}
          </div>
        </div>
      </div>,
      document.getElementById("modal-root") as HTMLElement
    );
  }

  return (
    <div className={`flex items-center justify-center py-4 ${className}`}>
      {spinnerElement}
    </div>
  );
};

const Spinner: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`spinner-container ${className}`}>
      <div className="loading-spinner"></div>
    </div>
  );
};

export { Spinner };
export default SpinnerTemplate;
