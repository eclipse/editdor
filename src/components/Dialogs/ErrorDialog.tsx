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
import DialogTemplate from "./DialogTemplate";

interface ErrorDialogProps {
  isOpen: boolean;
  errorMessage: string;
  onClose: () => void;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({
  isOpen,
  errorMessage,
  onClose,
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <DialogTemplate
      title="Error"
      description={errorMessage}
      onSubmit={onClose}
      submitText="OK"
      className="text-lg"
    />,
    document.getElementById("modal-root") as HTMLElement
  );
};

export default ErrorDialog;
