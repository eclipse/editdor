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
import React, { useReducer } from 'react';

import EdiTDorContext from './ediTDorContext';
import { editdorReducer, REMOVE_FORM_FROM_TD, REMOVE_LINK_FROM_TD, UPDATE_IS_THINGMODEL, SET_FILE_HANDLE, UPDATE_IS_MODFIED, UPDATE_OFFLINE_TD, ADD_PROPERTYFORM_TO_TD, ADD_ACTIONFORM_TO_TD, ADD_EVENTFORM_TO_TD, REMOVE_ONE_OF_A_KIND_FROM_TD, UPDATE_SHOW_CONVERT_BTN, ADD_LINKED_TD, UPDATE_LINKED_TD} from './editorReducers';


const GlobalState = props => {
  const [editdorState, dispatch] = useReducer(editdorReducer, { offlineTD: '', theme: 'dark' });

  const updateOfflineTD = (offlineTD, props) => {
    dispatch({ type: UPDATE_OFFLINE_TD, offlineTD: offlineTD });
  };

  const updateIsModified = isModified => {
    dispatch({ type: UPDATE_IS_MODFIED, isModified: isModified });
  };

  const updateIsThingModel = isThingModel => {
    dispatch({ type: UPDATE_IS_THINGMODEL, isThingModel: isThingModel });
  };

  const setFileHandle = fileHandle => {
    dispatch({ type: SET_FILE_HANDLE, fileHandle: fileHandle });
  };

  const removeForm = form => {
    dispatch({ type: REMOVE_FORM_FROM_TD, form: form });
  };

  const removeLink = link => {
    dispatch({ type: REMOVE_LINK_FROM_TD, link: link });
  };

  const addForm = form => {
    dispatch({ type: ADD_PROPERTYFORM_TO_TD, form: form });
  };

  const addActionForm = params => {
    dispatch({ type: ADD_ACTIONFORM_TO_TD, params: params });
  };
  const addEventForm = params => {
    dispatch({ type: ADD_EVENTFORM_TO_TD, params: params });
  };
  const removeOneOfAKindReducer = (kind, oneOfAKindName) => {
    dispatch({ type: REMOVE_ONE_OF_A_KIND_FROM_TD, kind, oneOfAKindName });
  };
  const updateShowConvertBtn = showConvertBtn => {
    dispatch({ type: UPDATE_SHOW_CONVERT_BTN, showConvertBtn: showConvertBtn });
  };

  const addLinkedTd = linkedTd => {
    dispatch({ type: ADD_LINKED_TD, linkedTd: linkedTd });
  };

  const updateLinkedTd = linkedTd => {
    dispatch({ type: UPDATE_LINKED_TD, linkedTd: linkedTd });
  };

  return (
    <EdiTDorContext.Provider
      value={{
        offlineTD: editdorState.offlineTD,
        theme: editdorState.theme,
        isModified: editdorState.isModified,
        isThingModel: editdorState.isThingModel,
        name: editdorState.name,
        fileHandle: editdorState.fileHandle,
        showConvertBtn: editdorState.showConvertBtn,
        linkedTd: editdorState.linkedTd,
        updateOfflineTD,
        updateIsModified,
        updateIsThingModel,
        setFileHandle,
        removeForm,
        removeLink,
        addForm,
        addActionForm,
        addEventForm,
        removeOneOfAKindReducer,
        updateShowConvertBtn,
        addLinkedTd,
        updateLinkedTd
      }}
    >
      {props.children}
    </EdiTDorContext.Provider>
  );
};

export default GlobalState;