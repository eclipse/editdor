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
import { editdorReducer, SET_FILE_HANDLE, UPDATE_IS_MODFIED, UPDATE_OFFLINE_TD } from './editorReducers';


const GlobalState = props => {
    const [editdorState, dispatch] = useReducer(editdorReducer, { offlineTD: '', theme: 'dark' });
  
    const updateOfflineTD = offlineTD => {
          dispatch({ type: UPDATE_OFFLINE_TD, offlineTD: offlineTD });
    };

    const updateIsModified = isModified => {
          dispatch({ type: UPDATE_IS_MODFIED, isModified: isModified });
    };

    const setFileHandleMethod = fileHandle => {
        dispatch({ type: SET_FILE_HANDLE, fileHandle: fileHandle });
    };

    return (
      <EdiTDorContext.Provider
        value={{
          offlineTD: editdorState.offlineTD,
          theme: editdorState.theme,
          isModified: editdorState.isModified,
          name: editdorState.name,
          fileHandle: editdorState.fileHandle,
          updateOfflineTD: updateOfflineTD,
          updateIsModified: updateIsModified,
          setFileHandle: setFileHandleMethod
        }}
      >
        {props.children}
      </EdiTDorContext.Provider>
    );
  };
  
  export default GlobalState;