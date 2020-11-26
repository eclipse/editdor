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
export const REMOVE_FORM_FROM_TD = 'REMOVE_FORM_FROM_TD';
export const ADD_FORM_FROM_TD = 'ADD_FORM_FROM_TD';

const updateOfflineTDReducer = (offlineTD, state) => {
  console.log('updateofflineTD')
  return { ...state, offlineTD: offlineTD, isModified: true };
};

const removeFormReducer = (form, state) => {
  let offlineTD = JSON.parse(state.offlineTD)
  offlineTD.properties[form.propName].forms.forEach((element, i) => {
    if (element.href === form.form.href && element.op.indexOf(form.form.op) !== -1) {
      element.op.splice(element.op.indexOf(form.form.op),1)
    }
    if (element.op.length === 0) {
      offlineTD.properties[form.propName].forms.splice(i,1)
    }
  });
  return { ...state, offlineTD: JSON.stringify(offlineTD,null,2) };
};

const addFormReducer = (form, state) => {
  let offlineTD = JSON.parse(state.offlineTD)
  offlineTD.properties[form.propName].forms.push(form.form);
  return { ...state, offlineTD: JSON.stringify(offlineTD,null,2) };
};


const updateIsModified = (isModified, state) => {
  console.log('updateIsModified', isModified)
  return { ...state, isModified: isModified };
};

const updateFileHandleReducer = (fileHandle, state) => {
  return { ...state, fileHandle: fileHandle };
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
    case REMOVE_FORM_FROM_TD:
      return removeFormReducer(action.form, state)
      case ADD_FORM_FROM_TD:
        return addFormReducer(action.form, state)
    default:
      return state;
  }
};