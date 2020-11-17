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
export const UPDATE_OFFLINE_TD = 'UPDATE_OFFLINE_TD';
export const UPDATE_IS_MODFIED = 'UPDATE_IS_MODFIED';
export const SET_FILE_HANDLE = 'SET_FILE_HANDLE';

const updateOfflineTDReducer = (offlineTD, state) => {
    console.log('updateofflineTD')
    return { ...state, offlineTD: offlineTD, isModified: true};
};


const updateIsModified = (isModified, state) => {
  console.log('updateIsModified', isModified)
  return { ...state,  isModified: isModified};
};

const updateFileHandleReducer = (fileHandle, state) => {
    // console.log('updateFileHandleReducer', state)
    return { ...state, fileHandle: fileHandle} ;
 };

export const editdorReducer = (state, action) => {
  switch (action.type) {
    case UPDATE_OFFLINE_TD:
      return updateOfflineTDReducer(action.offlineTD, state);
    case UPDATE_IS_MODFIED:
      return updateIsModified(action.isModified, state);
    case SET_FILE_HANDLE:
        const newState = updateFileHandleReducer(action.fileHandle, state)
        return newState;
    default:
      return state;
  }
};