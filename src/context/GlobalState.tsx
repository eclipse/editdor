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
import React, { ReactNode, useReducer } from "react";

import EdiTDorContext from "./ediTDorContext";
import { editdorReducer } from "./editorReducers";

export const UPDATE_OFFLINE_TD = "UPDATE_OFFLINE_TD";
export const UPDATE_IS_MODIFIED = "UPDATE_IS_MODIFIED";
export const SET_FILE_HANDLE = "SET_FILE_HANDLE";
export const REMOVE_FORM_FROM_TD = "REMOVE_FORM_FROM_TD";
export const REMOVE_LINK_FROM_TD = "REMOVE_LINK_FROM_TD";
export const ADD_FORM_TO_TD = "ADD_FORM_TO_TD";
export const REMOVE_ONE_OF_A_KIND_FROM_TD = "REMOVE_ONE_OF_A_KIND_FROM_TD";
export const ADD_LINKED_TD = "ADD_LINKED_TD";
export const UPDATE_LINKED_TD = "UPDATE_LINKED_TD";
export const UPDATE_VALIDATION_MESSAGE = "UPDATE_VALIDATION_MESSAGE";

interface IGlobalStateProps {
  children: ReactNode;
}

const GlobalState: React.FC<IGlobalStateProps> = ({ children }) => {
  const [editdorState, dispatch] = useReducer(editdorReducer, {
    offlineTD: "",
    validationMessage: "",
    parsedTD: {},
    isValidJSON: false,
  });

  const updateOfflineTD = (offlineTD: string) => {
    dispatch({ type: UPDATE_OFFLINE_TD, offlineTD: offlineTD });
  };

  const updateIsModified = (isModified: boolean) => {
    dispatch({ type: UPDATE_IS_MODIFIED, isModified: isModified });
  };

  const setFileHandle = (fileHandle: string | null) => {
    dispatch({ type: SET_FILE_HANDLE, fileHandle: fileHandle });
  };

  const removeLink = (link: any) => {
    dispatch({ type: REMOVE_LINK_FROM_TD, link: link });
  };

  const addForm = (
    level: "thing" | "properties" | "actions" | "events" | string,
    interactionName: string,
    form: Record<string, any>
  ) => {
    dispatch({
      type: ADD_FORM_TO_TD,
      level: level,
      interactionName: interactionName,
      form: form,
    });
  };

  const removeForm = (
    level: "thing" | "properties" | "actions" | "events" | string,
    interactionName: string,
    toBeDeletedForm: { href: string; op: string },
    index: number
  ) => {
    dispatch({
      type: REMOVE_FORM_FROM_TD,
      level: level,
      interactionName: interactionName,
      toBeDeletedForm: toBeDeletedForm,
      index: index,
    });
  };

  const removeOneOfAKindReducer = (
    kind: "thing" | "properties" | "actions" | "events" | string,
    oneOfAKindName: string
  ) => {
    dispatch({ type: REMOVE_ONE_OF_A_KIND_FROM_TD, kind, oneOfAKindName });
  };

  const addLinkedTd = (linkedTd: Record<string, any>) => {
    dispatch({ type: ADD_LINKED_TD, linkedTd: linkedTd });
  };

  const updateLinkedTd = (linkedTd: Record<string, any>) => {
    dispatch({ type: UPDATE_LINKED_TD, linkedTd: linkedTd });
  };

  const updateValidationMessage = (validationMessage?: string) => {
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
      {children}
    </EdiTDorContext.Provider>
  );
};

export default GlobalState;
