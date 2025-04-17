/********************************************************************************
 * Copyright (c) 2018 - 2020 Contributors to the Eclipse Foundation
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

/**
 * @typedef { import("../models").ValidationResults } ValidationResults
 */

export default React.createContext({
  offlineTD: "",
  isValidJSON: true,
  /** @type {Object} */
  parsedTD: {},

  isModified: false,
  name: "",
  fileHandle: "",
  linkedTd: {},
  /** @type {ValidationResults | undefined} */
  validationMessage: undefined,

  updateOfflineTD: (td) => {},
  updateIsModified: (isModified) => {},
  setFileHandle: (handle) => {},
  removeForm: (level, interactionName, index) => {},
  addForm: (level, interactionName, form) => {},
  removeLink: (link) => {},
  removeOneOfAKindReducer: (kind, oneOfAKind) => {},
  addLinkedTd: (linkedTd) => {},
  updateLinkedTd: (linkedTd) => {},
  updateValidationMessage: (validationMessage) => {},
});
