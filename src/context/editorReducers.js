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
export const UPDATE_OFFLINE_TD = "UPDATE_OFFLINE_TD";
export const UPDATE_IS_MODFIED = "UPDATE_IS_MODFIED";
export const SET_FILE_HANDLE = "SET_FILE_HANDLE";
export const REMOVE_FORM_FROM_TD = "REMOVE_FORM_FROM_TD";
export const REMOVE_LINK_FROM_TD = "REMOVE_LINK_FROM_TD";
export const ADD_FORM_TO_TD = "ADD_FORM_TO_TD";
export const REMOVE_ONE_OF_A_KIND_FROM_TD = "REMOVE_ONE_OF_A_KIND_FROM_TD";
export const ADD_LINKED_TD = "ADD_LINKED_TD";
export const UPDATE_LINKED_TD = "UPDATE_LINKED_TD";
export const UPDATE_VALIDATION_MESSAGE = "UPDATE_VALIDATION_MESSAGE";

export const editdorReducer = (state, action) => {
  switch (action.type) {
    case UPDATE_OFFLINE_TD:
      return updateOfflineTDReducer(action.offlineTD, state);
    case UPDATE_IS_MODFIED:
      return updateIsModified(action.isModified, state);
    case SET_FILE_HANDLE:
      return updateFileHandleReducer(action.fileHandle, state);
    case REMOVE_FORM_FROM_TD:
      return removeFormReducer(action.level, action.interactionName, action.toBeDeletedForm, action.index, state);
    case REMOVE_LINK_FROM_TD:
      return removeLinkReducer(action.link, state);
    case REMOVE_ONE_OF_A_KIND_FROM_TD:
      return removeOneOfAKindReducer(action.kind, action.oneOfAKindName, state);
    case ADD_FORM_TO_TD:
      return addFormReducer(action.level, action.interactionName, action.form, state);
    case ADD_LINKED_TD:
      return addLinkedTd(action.linkedTd, state);
    case UPDATE_LINKED_TD:
      return updateLinkedTd(action.linkedTd, state);
    case UPDATE_VALIDATION_MESSAGE:
      return updateValidationMessage(action.validationMessage, state);
    default:
      return state;
  }
};

const updateOfflineTDReducer = (offlineTD, state) => {
  if (offlineTD == state.offlineTD) {
    return state;
  }

  if (offlineTD === "") {
    return { ...state, offlineTD: "", isModified: true, isValidJSON: true, parsedTD: {} };
  }

  let parsedTD = undefined;
  try {
    parsedTD = JSON.parse(offlineTD);
  } catch (e) {
    console.error(e.message);
    return { ...state, offlineTD: offlineTD, isModified: true, isValidJSON: false, parsedTD: state.parsedTD };
  }

  let linkedTd = state.linkedTd;
  if (!linkedTd) {
    // If the user writes a Thing description without the wizard, we save it in linkedTd
    const href = parsedTD["title"] || "ediTDor Thing";
    linkedTd = { [href]: parsedTD };
  } else if (linkedTd && typeof state.fileHandle !== "object") {
    if (document.getElementById("linkedTd")) {
      const href = document.getElementById("linkedTd").value;
      if (href === "") {
        linkedTd[parsedTD["title"] || "ediTDor Thing"] = parsedTD;
      } else {
        linkedTd[href] = parsedTD;
      }
    }
  }

  return {
    ...state,
    offlineTD: offlineTD,
    isModified: true,
    isValidJSON: true,
    linkedTd: linkedTd,
    parsedTD: parsedTD,
  };
};

/**
 *
 * @param {"thing" | "properties" | "actions" | "events"} level
 * @param {string} interactionName
 * @param {{href: string; op: string;}} toBeDeletedForm
 * @param {number} index
 * @param {Object} state
 * @returns
 */
const removeFormReducer = (level, interactionName, toBeDeletedForm, index, state) => {
  if (!state.isValidJSON) {
    return state;
  }

  let td = structuredClone(state.parsedTD);
  let forms = undefined;
  if (level === "thing") {
    if (!td.forms || !Array.isArray(td.forms)) {
      return state;
    }

    forms = td.forms;
  } else {
    // check whether the JSON structure to the to be deleted Form exists
    if (!td[level] || !td[level][interactionName] || !td[level][interactionName].forms) {
      return state;
    }

    if (!Array.isArray(td[level][interactionName].forms)) {
      return state;
    }

    forms = td[level][interactionName].forms;
  }

  // at this point we know that the wanted Forms attribute exists and that its an array
  if (!forms || index > forms.length - 1) {
    return state;
  }

  if (forms[index]?.op && Array.isArray(forms[index].op)) {
    const opIndex = forms[index].op.indexOf(toBeDeletedForm.op);
    if (opIndex === -1) {
      return state;
    }

    forms[index].op.splice(opIndex, 1);
    if (forms[index].op.length == 0) {
      forms.splice(index, 1);
    }
  } else if (forms[index]?.op === toBeDeletedForm.op) {
    forms.splice(index, 1);
  }

  return { ...state, offlineTD: JSON.stringify(td, null, 2), parsedTD: td };
};

const removeLinkReducer = (index, state) => {
  if (!state.isValidJSON) {
    return state;
  }

  let td = structuredClone(state.parsedTD);

  try {
    td.links.splice(index, 1);
  } catch (e) {
    alert("Sorry we were unable to delete the Link.");
  }

  let linkedTd = state.linkedTd;
  if (linkedTd && typeof state.fileHandle !== "object") {
    // TODO: get rid of document.getElement check here
    if (document.getElementById("linkedTd")) {
      let href = document.getElementById("linkedTd").value;
      if (href === "") {
        linkedTd[td["title"] || "ediTDor Thing"] = td;
      } else {
        linkedTd[href] = td;
      }
    }
  }

  return { ...state, offlineTD: JSON.stringify(td, null, 2), linkedTd: linkedTd, parsedTD: td };
};

const removeOneOfAKindReducer = (kind, oneOfAKindName, state) => {
  if (!state.isValidJSON) {
    return state;
  }

  let td = structuredClone(state.parsedTD);

  try {
    delete td[kind][oneOfAKindName];
  } catch (e) {
    alert("Sorry we were unable to delete the Form.");
  }

  return { ...state, offlineTD: JSON.stringify(td, null, 2), parsedTD: td };
};

/**
 *
 * @param {"thing" | "properties" | "actions" | "events"} level
 * @param {string} interactionName
 * @param {Object} form
 * @param {Object} state
 * @returns
 */
const addFormReducer = (level, interactionName, form, state) => {
  if (!state.isValidJSON) {
    return state;
  }

  let td = structuredClone(state.parsedTD);
  if (level == "thing") {
    if (td.forms && !Array.isArray(td.forms)) {
      return state;
    }

    if (!td.forms) {
      td.forms = [];
    }

    td.forms.push(form);
    return { ...state, offlineTD: JSON.stringify(td, null, 2), parsedTD: td };
  }

  // interaction type or interaction itself doesn't exist
  if (!td[level] || !td[level][interactionName]) {
    return state;
  }

  const interaction = td[level][interactionName];
  if (!interaction.forms) {
    interaction.forms = [];
  }
  interaction.forms.push(form);

  return { ...state, offlineTD: JSON.stringify(td, null, 2), parsedTD: td };
};

const addLinkedTd = (td, state) => {
  let linkedTd = structuredClone(state.linkedTd);
  let resultingLinkedTd = {};

  if (linkedTd === undefined) {
    resultingLinkedTd = td;
  } else {
    resultingLinkedTd = Object.assign(linkedTd, td);
  }

  return { ...state, linkedTd: resultingLinkedTd };
};

const updateLinkedTd = (td, state) => {
  return { ...state, linkedTd: td };
};

const updateIsModified = (isModified, state) => {
  return { ...state, isModified: isModified };
};

const updateFileHandleReducer = (fileHandle, state) => {
  return { ...state, fileHandle: fileHandle };
};

const updateValidationMessage = (validationMessage, state) => {
  return { ...state, validationMessage };
};