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
import React from 'react';

export default React.createContext({
  offlineTD: '',
  theme: 'dark',
  isModified: false,
  isThingModel: undefined,
  name: '',
  fileHandle:'',
  showConvertBtn: false,
  linkedTd:{},
  validationMessage: '',
  updateOfflineTD: td => {},
  updateIsModified: isModified => {},
  updateIsThingModel: isThingModel => {},
  setFileHandle: handle => {},
  removeForm: form => {},
  addForm: form => {},
  removeLink: link => {},
  addActionForm: params => {},
  addEventForm: params => {},
  removeOneOfAKindReducer: (kind, oneOfAKind) => {},
  updateShowConvertBtn: showConvertBtn => {},
  addLinkedTd: linkedTd => {},
  updateLinkedTd: linkedTd => {},
  updateValidationMessage: validationMessage => {}
});
