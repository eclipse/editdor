/********************************************************************************
 * Copyright (c) 2018 Contributors to the Eclipse Foundation
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
import React, {
  forwardRef,
  useContext,
  useRef,
  useState,
  useImperativeHandle,
} from "react";
import ReactDOM from "react-dom";
import ediTDorContext from "../../context/ediTDorContext";
import DialogTemplate from "./DialogTemplate";
import ErrorDialog from "./ErrorDialog";
import FormCreateTd from "./base/FormCreateTd";

export interface CreateTdDialogRef {
  openModal: () => void;
  close: () => void;
}
type ThingType = "TD" | "TM";

const CreateTdDialog = forwardRef((props, ref) => {
  const context = useContext(ediTDorContext) as any;
  const [display, setDisplay] = useState<boolean>(false);
  const [type, setType] = useState<ThingType>("TD");
  const [properties, setProperties] = useState<Record<string, unknown>>({});
  const [fileName, setFileName] = useState<string>("");

  const [thingId, setThingId] = useState<string>("");
  const [thingTitle, setThingTitle] = useState<string>("");
  const [thingBase, setThingBase] = useState<string>("");
  const [thingDescription, setThingDescription] = useState<string>("");
  const [thingSecurity, setThingSecurity] = useState<string>("nosec");
  const [protocol, setProtocol] = useState<string>("Modbus TCP");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  useImperativeHandle(ref, () => {
    return {
      openModal: () => open(),
      close: () => close(),
    };
  });

  const open = () => {
    setDisplay(true);
  };
  const resetForm = () => {
    setThingId("");
    setThingTitle("");
    setThingBase("");
    setThingDescription("");
    setThingSecurity("nosec");
    setProtocol("Modbus TCP");
    setFileName("");
  };

  const close = () => {
    resetForm();
    setError({ open: false, message: "" });
    setDisplay(false);
  };

  const changeType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value as "TD" | "TM");
  };

  const createNewTD = (
    type: "TD" | "TM",
    properties: Record<string, any>
  ): Record<string, any> => {
    const td: Record<string, unknown> = {};
    td["@context"] = "https://www.w3.org/2019/wot/td/v1";
    td["title"] = thingTitle.trim() !== "" ? thingTitle.trim() : "";

    if (type === "TM") {
      td["@type"] = "tm:ThingModel";
    }

    if (thingId.trim() !== "") {
      td["id"] = thingId.trim();
    }

    let resolvedBase: string;
    if (fileName && !thingBase.trim()) {
      resolvedBase = "modbus+tcp://{{IP}}:{{PORT}}";
    } else if (!fileName && !thingBase.trim()) {
      resolvedBase = "/";
    } else {
      resolvedBase = thingBase.trim();
    }
    td["base"] = resolvedBase;

    if (thingDescription.trim() !== "") {
      td["description"] = thingDescription.trim();
    }

    const secKey = `${thingSecurity}_sc`;
    td["securityDefinitions"] = { [secKey]: { scheme: thingSecurity } };
    td["security"] = secKey;

    td["properties"] = properties;
    td["actions"] = {};
    td["events"] = {};

    return td;
  };

  const handleCreate = () => {
    const td = createNewTD(type, properties);
    const linkedTd: Record<string, unknown> = { [td["title"]]: td };
    context.updateLinkedTd(undefined);
    context.addLinkedTd(linkedTd);
    context.updateOfflineTD(JSON.stringify(td, null, 2));
    close();
  };
  if (!display) return null;
  return (
    <>
      <ErrorDialog
        isOpen={error.open}
        errorMessage={error.message}
        onClose={() => setError({ open: false, message: "" })}
      />
      {ReactDOM.createPortal(
        <DialogTemplate
          onHandleEventLeftButton={close}
          onHandleEventRightButton={handleCreate}
          rightButton={type === "TD" ? "Create TD" : "Create TM"}
          title={"Create a New TD/TM"}
          description={
            "To quickly create a basis for your new Thing Description/Thing Model just fill out this little template and we'll get you going."
          }
        >
          <FormCreateTd
            type={type}
            onChangeType={changeType}
            protocol={protocol}
            setProtocol={setProtocol}
            fileName={fileName}
            setFileName={setFileName}
            fileInputRef={fileInputRef}
            setProperties={setProperties}
            setError={setError}
            thingId={thingId}
            setThingId={setThingId}
            thingTitle={thingTitle}
            setThingTitle={setThingTitle}
            thingBase={thingBase}
            setThingBase={setThingBase}
            thingDescription={thingDescription}
            setThingDescription={setThingDescription}
            thingSecurity={thingSecurity}
            setThingSecurity={setThingSecurity}
          ></FormCreateTd>
        </DialogTemplate>,
        document.getElementById("modal-root") as HTMLElement
      )}
    </>
  );
});

CreateTdDialog.displayName = "CreateTdDialog";
export default CreateTdDialog;
