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
export const UPDATE_IS_THINGMODEL = 'UPDATE_IS_THINGMODEL';
export const SET_FILE_HANDLE = 'SET_FILE_HANDLE';
export const REMOVE_FORM_FROM_TD = 'REMOVE_FORM_FROM_TD';
export const REMOVE_LINK_FROM_TD = 'REMOVE_LINK_FROM_TD';
export const ADD_PROPERTYFORM_TO_TD = 'ADD_PROPERTYFORM_TO_TD';
export const ADD_ACTIONFORM_TO_TD = 'ADD_ACTIONFORM_TO_TD';
export const ADD_EVENTFORM_TO_TD = 'ADD_EVENTFORM_TO_TD';
export const REMOVE_ONE_OF_A_KIND_FROM_TD = 'REMOVE_ONE_OF_A_KIND_FROM_TD';
export const UPDATE_SHOW_CONVERT_BTN = 'UPDATE_SHOW_CONVERT_BTN';
export const ADD_LINKED_TD = 'ADD_LINKED_TD';
export const UPDATE_LINKED_TD = 'UPDATE_LINKED_TD'

const updateOfflineTDReducer = (offlineTD, state) => {
  let linkedTd=state.linkedTd
  try{
    //If the user write Thing description without wizard, we save it in linkedTd
    if(!linkedTd){
      let parsedTd=JSON.parse(offlineTD)
      linkedTd={}
      let href=parsedTd["title"]||"ediTDor Thing"
      linkedTd[href]=parsedTd
    }
    else if(linkedTd&& typeof state.fileHandle !== "object"){
      let parsedTd=JSON.parse(offlineTD)
      if(document.getElementById("linkedTd")){
        let href= document.getElementById("linkedTd").value
        if(href===""){
        linkedTd[parsedTd["title"]||"ediTDor Thing"]=parsedTd
        }
        else{
          linkedTd[href]=parsedTd
        }
      }
    }
  }catch(e){
    let error = e.message;
    console.log(error)
  }
  return { ...state, offlineTD, isModified: true, linkedTd:linkedTd };
};

const removeFormReducer = (form, state) => {
  let offlineTD = JSON.parse(state.offlineTD)
  console.log(form);
  if (form.type === 'forms') {
    offlineTD.forms.forEach((element, i) => {
      if (typeof (element.op) === 'string') {
          offlineTD.forms.splice(i, 1)
      } else {
        if (element.href === form.form.href && element.op.indexOf(form.form.op) !== -1) {
          element.op.splice(element.op.indexOf(form.form.op), 1)
        }
        if (element.op.length === 0) {
          offlineTD.forms.splice(i, 1)
        }
      }
    });
  } else {
    try {
      offlineTD[form.type][form.propName].forms.forEach((element, i) => {
        if (typeof (element.op) === 'string') {
          if (element.href === form.form.href) {
            offlineTD[form.type][form.propName].forms.splice(i, 1)
          }
        } else {
          if (element.href === form.form.href && element.op.indexOf(form.form.op) !== -1) {
            element.op.splice(element.op.indexOf(form.form.op), 1)
          }
          if (element.op.length === 0) {
            offlineTD[form.type][form.propName].forms.splice(i, 1)
          }
        }
      });
    } catch (e) {
      alert('Sorry we were unable to delete the Form.');
    }
  }
  return { ...state, offlineTD: JSON.stringify(offlineTD, null, 2) };
};

const removeLinkReducer = (index, state) => {
  let offlineTD = JSON.parse(state.offlineTD)
    try {
      offlineTD["links"].splice(index,1)
    } catch (e) {
      alert('Sorry we were unable to delete the Link.');
    }
  let linkedTd=state.linkedTd
  if(linkedTd&& typeof state.fileHandle !== "object"){
    if(document.getElementById("linkedTd")){
      let href= document.getElementById("linkedTd").value
      if(href===""){
      linkedTd[offlineTD["title"]||"ediTDor Thing"]=offlineTD
      }
      else{
        linkedTd[href]=offlineTD
      }
    }
  }
  return { ...state, offlineTD: JSON.stringify(offlineTD, null, 2),linkedTd:linkedTd };
};

const removeOneOfAKindReducer = (kind, oneOfAKindName, state) => {
  let offlineTD = JSON.parse(state.offlineTD)
  try {
    delete offlineTD[kind][oneOfAKindName]
  } catch (e) {
    alert('Sorry we were unable to delete the Form.');
  }
  return { ...state, offlineTD: JSON.stringify(offlineTD, null, 2) };
};

const addPropertyFormReducer = (form, state) => {
  let offlineTD = JSON.parse(state.offlineTD)
  const property = offlineTD.properties[form.propName];
  if (property.forms === undefined) {
    property.forms = []
  }
  property.forms.push(form.form);
  return { ...state, offlineTD: JSON.stringify(offlineTD, null, 2) };
};

const addLinkedTd = (td, state) =>{
  let resultingLinkedTd ={}
  let linkedTd= state.linkedTd

  if(linkedTd === undefined){
     resultingLinkedTd=td
  }
  else{
  resultingLinkedTd = Object.assign(linkedTd, td)
  }
  return { ...state, linkedTd: resultingLinkedTd };
}

const updateLinkedTd = (td, state) =>{
  return { ...state, linkedTd: td };
}

const addActionFormReducer = (params, state) => {
  let offlineTD = JSON.parse(state.offlineTD)
  const action = offlineTD.actions[params.actionName];
  console.log('ActionForms', action.forms)
  if (action.forms === undefined) {
    action.forms = []
  }
  action.forms.push(params.form);
  return { ...state, offlineTD: JSON.stringify(offlineTD, null, 2) };
};

const addEventFormReducer = (params, state) => {
  let offlineTD = JSON.parse(state.offlineTD)
  const event = offlineTD.events[params.eventName];
  if (event.forms === undefined) {
    event.forms = []
  }
  event.forms.push(params.form);
  return { ...state, offlineTD: JSON.stringify(offlineTD, null, 2) };
};

const updateIsModified = (isModified, state) => {
  return { ...state, isModified: isModified };
};

const updateIsThingModel = (isThingModel, state) => {
  return { ...state, isThingModel: isThingModel };
};

const updateFileHandleReducer = (fileHandle, state) => {
  return { ...state, fileHandle: fileHandle };
};

const updateShowConvertBtn = (showConvertBtn, state) => {
  return { ...state, showConvertBtn: showConvertBtn };
};

const editdorReducer = (state, action) => {
  switch (action.type) {
    case UPDATE_OFFLINE_TD:
      return updateOfflineTDReducer(action.offlineTD, state);
    case UPDATE_IS_MODFIED:
      return updateIsModified(action.isModified, state);
    case UPDATE_IS_THINGMODEL:
      return updateIsThingModel(action.isThingModel, state);
    case SET_FILE_HANDLE:
      const newState = updateFileHandleReducer(action.fileHandle, state)
      return newState;
    case REMOVE_FORM_FROM_TD:
      return removeFormReducer(action.form, state)
    case REMOVE_LINK_FROM_TD:
        return removeLinkReducer(action.link, state)
    case REMOVE_ONE_OF_A_KIND_FROM_TD:
      return removeOneOfAKindReducer(action.kind, action.oneOfAKindName, state)
    case ADD_PROPERTYFORM_TO_TD:
      return addPropertyFormReducer(action.form, state)
    case ADD_ACTIONFORM_TO_TD:
      return addActionFormReducer(action.params, state)
    case ADD_EVENTFORM_TO_TD:
      return addEventFormReducer(action.params, state)
    case UPDATE_SHOW_CONVERT_BTN:
      return updateShowConvertBtn(action.showConvertBtn, state);
    case ADD_LINKED_TD:
      return addLinkedTd(action.linkedTd,state)
    case UPDATE_LINKED_TD:
      return updateLinkedTd(action.linkedTd,state)
    default:
      return state;
  }
};

export { editdorReducer }