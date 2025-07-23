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
import React, { useContext } from "react";
import ediTDorContext from "../../context/ediTDorContext";
import { GitHub } from "react-feather";
import type { ThingDescription } from "wot-thing-description-types";

const AppFooter: React.FC = (props) => {
  const context = useContext(ediTDorContext);

  const megaBytes = formatByteSize(context.offlineTD.length);
  let propertiesCount = 0;
  let actionsCount = 0;
  let eventsCount = 0;

  if (Object.keys(context.parsedTD).length !== 0) {
    const td: ThingDescription = context.parsedTD;
    propertiesCount = td.properties ? Object.keys(td.properties).length : 0;
    actionsCount = td.actions ? Object.keys(td.actions).length : 0;
    eventsCount = td.events ? Object.keys(td.events).length : 0;
  }

  return (
    <>
      <footer className="flex h-10 flex-col justify-center bg-blue-500 text-white">
        <div className="flex items-center px-2">
          <div className="hidden grow items-center gap-2 md:flex">
            <div>Properties: {propertiesCount}</div>
            <div>| Actions: {actionsCount}</div>
            <div>| Events: {eventsCount}</div>
            <div>| Size: {megaBytes}</div>
          </div>
          <div className="flex grow gap-2 md:hidden">
            <div>P: {propertiesCount}</div>
            <div>| A: {actionsCount}</div>
            <div>| E: {eventsCount}</div>
            <div className="flex">
              <div>| {megaBytes}</div>
              {context.isModified && <div className="md:hidden">*</div>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {context.isModified && (
              <div className="hidden md:block">You have unsaved changes - </div>
            )}
            <div>v{APP_VERSION}</div>
            <a
              className="rounded-full bg-black p-2"
              href="https://github.com/eclipse/editdor"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHub size={16} />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

function formatByteSize(bytes: number): string {
  if (bytes < 1024) return bytes + " bytes";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + " KiB";
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + " MiB";
  else return (bytes / 1073741824).toFixed(3) + " GiB";
}

export default AppFooter;
