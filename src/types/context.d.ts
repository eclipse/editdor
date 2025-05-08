interface IEdiTDorContext {
  // offlineTD: Saving or displaying the TD as JSON For storage, sharing, or exporting Primary source of truth for the TD
  offlineTD: string;
  isValidJSON: boolean;
  // ParsedTD: Accessing and modifying TD properties 	For programmatic manipulation JavaScript object Derived from offlineTD
  parsedTD: IThingDescription | {};
  isModified: boolean;
  name: string;
  fileHandle: string | null;
  linkedTd: Record<string, any>;
  validationMessage?: any;

  // Callback functions
  updateOfflineTD: (td: string) => void;
  updateIsModified: (isModified: boolean) => void;
  setFileHandle: (handle: string | null) => void;
  removeForm: (
    level: string,
    interactionName: string,
    toBeDeletedForm: { href: string; op: string },
    index: number
  ) => void;
  addForm: (level: string, interactionName: string, form: any) => void;
  removeLink: (link: any) => void;
  removeOneOfAKindReducer: (kind: string, oneOfAKind: string) => void;
  addLinkedTd: (linkedTd: Record<string, any>) => void;
  updateLinkedTd: (linkedTd: Record<string, any>) => void;
  updateValidationMessage: (validationMessage?: any) => void;
}

type EditorState = Omit<
  IEdiTDorContext,
  | "updateOfflineTD"
  | "updateIsModified"
  | "setFileHandle"
  | "removeForm"
  | "addForm"
  | "removeLink"
  | "removeOneOfAKindReducer"
  | "addLinkedTd"
  | "updateLinkedTd"
  | "updateValidationMessage"
>;

type Action =
  | { type: typeof UPDATE_OFFLINE_TD; offlineTD: string }
  | { type: typeof UPDATE_IS_MODFIED; isModified: boolean } //TODO NEED FIX on Speelig
  | { type: typeof SET_FILE_HANDLE; fileHandle: any }
  | { type: typeof REMOVE_LINK_FROM_TD; link: any }
  | {
      type: typeof ADD_FORM_TO_TD;
      level: "thing" | "properties" | "actions" | "events" | string;
      interactionName: string;
      form: any;
    }
  | {
      type: typeof REMOVE_FORM_FROM_TD;
      level: "thing" | "properties" | "actions" | "events" | string;
      interactionName: string;
      toBeDeletedForm: any;
      index: number;
    }
  | {
      type: typeof REMOVE_ONE_OF_A_KIND_FROM_TD;
      kind: "thing" | "properties" | "actions" | "events" | string;
      oneOfAKindName: string;
    }
  | { type: typeof ADD_LINKED_TD; linkedTd: any }
  | { type: typeof UPDATE_LINKED_TD; linkedTd: any }
  | { type: typeof UPDATE_VALIDATION_MESSAGE; validationMessage: any };
