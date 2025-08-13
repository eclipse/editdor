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
//  Default
const defaultContext: IEdiTDorContext = {
  offlineTD: "",
  isValidJSON: true,
  parsedTD: {},
  isModified: false,
  name: "",
  fileHandle: null,
  linkedTd: {},
  validationMessage: undefined,
  northboundConnection: {
    message: "",
    northboundTd: {},
  },

  updateOfflineTD: () => {},
  updateIsModified: () => {},
  setFileHandle: () => {},
  removeForm: () => {},
  addForm: () => {},
  removeLink: () => {},
  removeOneOfAKindReducer: () => {},
  addLinkedTd: () => {},
  updateLinkedTd: () => {},
  updateValidationMessage: () => {},
  updateNorthboundConnection: () => {},
};

const ediTDorContext = React.createContext<IEdiTDorContext>(defaultContext);

export default ediTDorContext;
