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
import type { ThingDescription } from "wot-thing-description-types";
import { getLocalStorage } from "../services/localStorage";

type Validation = "VALID" | "INVALID" | "VALIDATING" | null;
export type ActiveSection = "INSTANCE" | "GATEWAY" | "TABLE" | "SAVING_RESULTS";
interface SectionError {
  error: boolean;
  message: string;
}
interface SettingsData {
  northboundUrl: string;
  southboundUrl: string;
  pathToValue: string;
}

// Define the shape of the state
export interface ContributionToCatalogState {
  workflow: {
    currentStep: number;
    showDialog: boolean;
    backgroundTdToSend: ThingDescription;
  };
  metadata: {
    model: string;
    author: string;
    manufacturer: string;
    license: string;
    copyrightYear: string;
    holder: string;
    copied: boolean;
    validation: Validation;
    errorMessage: string;
  };
  interaction: {
    activeSection: ActiveSection;
    sectionErrors: {
      instance: SectionError;
      gateway: SectionError;
      table: SectionError;
      results: SectionError;
    };
    isTestingAll: boolean;
    settingsData: SettingsData;
    placeholderValues: Record<string, string>;
    propertyResponseMap: Record<string, { value: string; error: string }>;
  };
  submission: {
    tmCatalogEndpoint: string;
    tmCatalogEndpointError: string;
    repository: string;
    repositoryError: string;
    submitted: boolean;
    submittedError: string;
    id: string;
    link: string;
  };
}

// Initial state
export const initialState: ContributionToCatalogState = {
  workflow: {
    currentStep: 1,
    showDialog: false,
    backgroundTdToSend: {} as ThingDescription,
  },
  metadata: {
    model: "",
    author: "",
    manufacturer: "",
    license: "",
    copyrightYear: "",
    holder: "",
    copied: false,
    validation: null,
    errorMessage: "",
  },
  interaction: {
    activeSection: "INSTANCE",
    sectionErrors: {
      instance: { error: false, message: "" },
      gateway: { error: false, message: "" },
      table: { error: false, message: "" },
      results: { error: false, message: "" },
    },
    isTestingAll: false,
    settingsData: {
      northboundUrl: getLocalStorage("northbound") || "",
      southboundUrl: getLocalStorage("southbound") || "",
      pathToValue: getLocalStorage("valuePath") || "/",
    },
    placeholderValues: {},
    propertyResponseMap: {},
  },
  submission: {
    tmCatalogEndpoint: "",
    tmCatalogEndpointError: "",
    repository: "",
    repositoryError: "",
    submitted: false,
    submittedError: "",
    id: "",
    link: "",
  },
};

// Define action types
export type ContributionToCatalogAction =
  | { type: "SET_STEP"; payload: number }
  | { type: "SHOW_DIALOG"; payload: boolean }
  | { type: "SET_BACKGROUND_TD_TO_SEND"; payload: ThingDescription }
  //
  | { type: "SET_METADATA_MODEL"; payload: string }
  | { type: "SET_METADATA_AUTHOR"; payload: string }
  | { type: "SET_METADATA_MANUFACTURER"; payload: string }
  | { type: "SET_METADATA_LICENSE"; payload: string }
  | { type: "SET_METADATA_COPYRIGHT_YEAR"; payload: string }
  | { type: "SET_METADATA_HOLDER"; payload: string }
  | { type: "SET_METADATA_VALIDATION"; payload: Validation }
  | { type: "SET_METADATA_ERROR_MESSAGE"; payload: string }
  | { type: "SET_METADATA_COPIED"; payload: boolean }
  | {
      type: "INITIALIZE_METADATA";
      payload: Partial<ContributionToCatalogState["metadata"]>;
    }
  //
  | { type: "SET_INTERACTION_ACTIVE_SECTION"; payload: ActiveSection }
  | {
      type: "SET_INTERACTION_SECTION_ERROR";
      section: "instance" | "gateway" | "table" | "saving_results";
      error: boolean;
      message: string;
    }
  | { type: "SET_INTERACTION_TESTING_ALL"; payload: boolean }
  | { type: "SET_INTERACTION_SETTINGS_DATA"; payload: SettingsData }
  | {
      type: "UPDATE_INTERACTION_PLACEHOLDER_VALUES";
      payload: Record<string, string>;
    }
  | {
      type: "UPDATE_INTERACTION_SINGLE_PLACEHOLDER";
      key: string;
      value: string;
    }
  | {
      type: "SET_INTERACTION_PROPERTY_RESPONSE_MAP";
      payload: Record<string, { value: string; error: string }>;
    }
  //
  | { type: "SET_SUBMISSION_TMCATALOG_ENDPOINT"; payload: string }
  | { type: "SET_SUBMISSION_TMCATALOG_ENDPOINT_ERROR"; payload: string }
  | { type: "SET_SUBMISSION_REPOSITORY"; payload: string }
  | { type: "SET_SUBMISSION_REPOSITORY_ERROR"; payload: string }
  | { type: "SET_SUBMISSION_SUBMITTED"; payload: boolean }
  | { type: "SET_SUBMISSION_SUBMITTED_ERROR"; payload: string }
  | { type: "SET_SUBMISSION_ID"; payload: string }
  | { type: "SET_SUBMISSION_LINK"; payload: string }
  //
  | { type: "RESET_STATE" };

// Reducer function
export function contributionToCatalogReducer(
  state: ContributionToCatalogState,
  action: ContributionToCatalogAction
): ContributionToCatalogState {
  switch (action.type) {
    case "SET_STEP":
      return {
        ...state,
        workflow: {
          ...state.workflow,
          currentStep: action.payload,
        },
      };
    case "SHOW_DIALOG":
      return {
        ...state,
        workflow: {
          ...state.workflow,
          showDialog: action.payload,
        },
      };
    case "SET_BACKGROUND_TD_TO_SEND":
      return {
        ...state,
        workflow: {
          ...state.workflow,
          backgroundTdToSend: action.payload,
        },
      };
    case "SET_METADATA_MODEL":
      return {
        ...state,
        metadata: {
          ...state.metadata,
          model: action.payload,
        },
      };
    case "SET_METADATA_AUTHOR":
      return {
        ...state,
        metadata: {
          ...state.metadata,
          author: action.payload,
        },
      };
    case "SET_METADATA_MANUFACTURER":
      return {
        ...state,
        metadata: {
          ...state.metadata,
          manufacturer: action.payload,
        },
      };
    case "SET_METADATA_LICENSE":
      return {
        ...state,
        metadata: {
          ...state.metadata,
          license: action.payload,
        },
      };
    case "SET_METADATA_COPYRIGHT_YEAR":
      return {
        ...state,
        metadata: {
          ...state.metadata,
          copyrightYear: action.payload,
        },
      };
    case "SET_METADATA_HOLDER":
      return {
        ...state,
        metadata: {
          ...state.metadata,
          holder: action.payload,
        },
      };
    case "SET_METADATA_VALIDATION":
      return {
        ...state,
        metadata: {
          ...state.metadata,
          validation: action.payload,
        },
      };
    case "SET_METADATA_ERROR_MESSAGE":
      return {
        ...state,
        metadata: {
          ...state.metadata,
          errorMessage: action.payload,
          validation: "INVALID",
        },
      };
    case "SET_METADATA_COPIED":
      return {
        ...state,
        metadata: {
          ...state.metadata,
          copied: action.payload,
        },
      };
    case "INITIALIZE_METADATA":
      return {
        ...state,
        metadata: {
          ...state.metadata,
          ...action.payload,
        },
      };
    //
    case "SET_INTERACTION_ACTIVE_SECTION":
      return {
        ...state,
        interaction: {
          ...state.interaction,
          activeSection: action.payload,
        },
      };
    case "SET_INTERACTION_SECTION_ERROR":
      return {
        ...state,
        interaction: {
          ...state.interaction,
          sectionErrors: {
            ...state.interaction.sectionErrors,
            [action.section]: {
              error: action.error,
              message: action.message,
            },
          },
        },
      };
    case "SET_INTERACTION_TESTING_ALL":
      return {
        ...state,
        interaction: {
          ...state.interaction,
          isTestingAll: action.payload,
        },
      };
    case "SET_INTERACTION_SETTINGS_DATA":
      return {
        ...state,
        interaction: {
          ...state.interaction,
          settingsData: action.payload,
        },
      };
    case "UPDATE_INTERACTION_PLACEHOLDER_VALUES":
      return {
        ...state,
        interaction: {
          ...state.interaction,
          placeholderValues: action.payload,
        },
      };
    case "UPDATE_INTERACTION_SINGLE_PLACEHOLDER":
      return {
        ...state,
        interaction: {
          ...state.interaction,
          placeholderValues: {
            ...state.interaction.placeholderValues,
            [action.key]: action.value,
          },
        },
      };
    case "SET_INTERACTION_PROPERTY_RESPONSE_MAP":
      return {
        ...state,
        interaction: {
          ...state.interaction,
          propertyResponseMap: action.payload,
        },
      };
    //
    case "SET_SUBMISSION_TMCATALOG_ENDPOINT":
      return {
        ...state,
        submission: {
          ...state.submission,
          tmCatalogEndpoint: action.payload,
        },
      };
    case "SET_SUBMISSION_TMCATALOG_ENDPOINT_ERROR":
      return {
        ...state,
        submission: {
          ...state.submission,
          tmCatalogEndpointError: action.payload,
        },
      };
    case "SET_SUBMISSION_REPOSITORY":
      return {
        ...state,
        submission: {
          ...state.submission,
          repository: action.payload,
        },
      };
    case "SET_SUBMISSION_REPOSITORY_ERROR":
      return {
        ...state,
        submission: {
          ...state.submission,
          repositoryError: action.payload,
        },
      };
    case "SET_SUBMISSION_SUBMITTED":
      return {
        ...state,
        submission: {
          ...state.submission,
          submitted: action.payload,
        },
      };
    case "SET_SUBMISSION_SUBMITTED_ERROR":
      return {
        ...state,
        submission: {
          ...state.submission,
          submittedError: action.payload,
        },
      };
    case "SET_SUBMISSION_ID":
      return {
        ...state,
        submission: {
          ...state.submission,
          id: action.payload,
        },
      };
    case "SET_SUBMISSION_LINK":
      return {
        ...state,
        submission: {
          ...state.submission,
          link: action.payload,
        },
      };
    //
    case "RESET_STATE":
      return initialState;
    default:
      return state;
  }
}
