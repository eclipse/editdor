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
import React, { useReducer } from "react";

import EdiTDorContext from "./ediTDorContext";
import {
  editdorReducer,
  REMOVE_FORM_FROM_TD,
  REMOVE_LINK_FROM_TD,
  SET_FILE_HANDLE,
  UPDATE_IS_MODFIED,
  UPDATE_OFFLINE_TD,
  REMOVE_ONE_OF_A_KIND_FROM_TD,
  ADD_LINKED_TD,
  UPDATE_LINKED_TD,
  UPDATE_VALIDATION_MESSAGE,
  ADD_FORM_TO_TD,
} from "./editorReducers";

const GlobalState = (props) => {
  const [editdorState, dispatch] = useReducer(editdorReducer, {
    offlineTD: "",
    validationMessage: "",
    parsedTD: {},
    isValidJSON: true,
  });

  const updateOfflineTD = (offlineTD) => {
    dispatch({ type: UPDATE_OFFLINE_TD, offlineTD: offlineTD });
  };

  const updateIsModified = (isModified) => {
    dispatch({ type: UPDATE_IS_MODFIED, isModified: isModified });
  };

  const setFileHandle = (fileHandle) => {
    dispatch({ type: SET_FILE_HANDLE, fileHandle: fileHandle });
  };

  const removeLink = (link) => {
    dispatch({ type: REMOVE_LINK_FROM_TD, link: link });
  };

  const addForm = (level, interactionName, form) => {
    dispatch({
      type: ADD_FORM_TO_TD,
      level: level,
      interactionName: interactionName,
      form: form,
    });
  };

  const removeForm = (level, interactionName, toBeDeletedForm, index) => {
    dispatch({
      type: REMOVE_FORM_FROM_TD,
      level: level,
      interactionName: interactionName,
      toBeDeletedForm: toBeDeletedForm,
      index: index,
    });
  };

  const removeOneOfAKindReducer = (kind, oneOfAKindName) => {
    dispatch({ type: REMOVE_ONE_OF_A_KIND_FROM_TD, kind, oneOfAKindName });
  };

  const addLinkedTd = (linkedTd) => {
    dispatch({ type: ADD_LINKED_TD, linkedTd: linkedTd });
  };

  const updateLinkedTd = (linkedTd) => {
    dispatch({ type: UPDATE_LINKED_TD, linkedTd: linkedTd });
  };

  const updateValidationMessage = (validationMessage) => {
    dispatch({
      type: UPDATE_VALIDATION_MESSAGE,
      validationMessage: validationMessage,
    });
  };

  return (
    <EdiTDorContext.Provider
      value={{
        offlineTD: editdorState.offlineTD,
        isModified: editdorState.isModified,
        isValidJSON: editdorState.isValidJSON,
        parsedTD: editdorState.parsedTD,
        name: editdorState.name,
        fileHandle: editdorState.fileHandle,
        linkedTd: editdorState.linkedTd,
        validationMessage: editdorState.validationMessage,
        updateOfflineTD,
        updateIsModified,
        setFileHandle,
        removeLink,
        addForm,
        removeForm,
        removeOneOfAKindReducer,
        addLinkedTd,
        updateLinkedTd,
        updateValidationMessage,
      }}
    >
      {props.children}
    </EdiTDorContext.Provider>
  );
};

export default GlobalState;
