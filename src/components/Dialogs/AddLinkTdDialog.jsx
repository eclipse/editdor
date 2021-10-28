/********************************************************************************
 * Copyright (c) 2018 - 2021 Contributors to the Eclipse Foundation
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
 import React, { forwardRef, useContext, useEffect, useImperativeHandle,useCallback } from 'react';
 import ReactDOM from "react-dom";
 import ediTDorContext from "../../context/ediTDorContext";
 import {hasLinks,checkIfLinkIsInItem } from "../../util.js";
 import { DialogTemplate } from "./DialogTemplate";

 export const AddLinkTdDialog = forwardRef((props, ref) => {
     const context = useContext(ediTDorContext);
     const [display, setDisplay] = React.useState(() => { return false });
     const [linkingMethod, setlinkingMethod] = React.useState(() => { return "url" });
     const [currentLinkedTd, setCurrentLinkedTd] = React.useState(() => { return {} });


     const interaction = props.interaction ?? {};
     const offlineTD = JSON.parse(context.offlineTD)

     useEffect(() => {
     }, [display, context]);

     useImperativeHandle(ref, () => {
         return {
             openModal: () => open(),
             close: () => close()
         }
     });

     const open = () => {
         setDisplay(true)
     };

     const close = () => {
         setDisplay(false);
     };


     const checkIfLinkExists = (link) => {
         if (hasLinks(interaction)) {
            return checkIfLinkIsInItem(link, interaction)
         }
         return false
     }

     const addLinksToInteraction = (link) => {
                let td = {}
                 try {
                     td = JSON.parse(context.offlineTD);
                 } catch (_) { }
                 if (!hasLinks(td)) {
                     td.links = [];
                 }
                 td.links.push(link);
                 context.updateOfflineTD(JSON.stringify(td, null, 2))
     }

     const getFileHandle = () => {
        const opts = {
          types: [
            {
              description: "Thing Description",
              accept: { "application/ld+json": [".jsonld", ".json"] },
            },
          ],
        };
        if ("showOpenFilePicker" in window) {
          return window.showOpenFilePicker(opts).then((handles) => handles[0]);
        }
        return window.chooseFileSystemEntries();
      };

     const getFileHTML5 = async () => {
        return new Promise((resolve, reject) => {
          const fileInput = document.getElementById("fileInput");
          fileInput.onchange = (e) => {
            const file = fileInput.files[0];
            if (file) {
              return resolve(file);
            }
            return reject(new Error("AbortError"));
          };
          fileInput.click();
        });
      };


     const hasNativeFS = useCallback(() => {
        return (
          "chooseFileSystemEntries" in window || "showOpenFilePicker" in window
        );
      }, []);

      /**
       *
       * @param {*} file
       *
       * Read file content
       */

      const linkingMethodChange= (linkingOption) => {
          setlinkingMethod(linkingOption)
          if(currentLinkedTd && linkingOption === 'url'){
            setCurrentLinkedTd({})
          }
      }

     const openFile = useCallback(
        async (_) => {

          if (!hasNativeFS()) {
            const file = await getFileHTML5();
            if (file) {
                document.getElementById("link-href").value="./"+file.name
            }
            return;
          }

          let fileHandle;
          try {
            fileHandle = await getFileHandle();
            const file = await fileHandle.getFile();
            const href="./"+file.name
            setCurrentLinkedTd(fileHandle)
            document.getElementById("link-href").value=href
          } catch (ex) {
            console.log(ex)
            const msg = "We ran into an error trying to open your TD.";
            console.error(msg, ex);
            alert(msg);
          }
        },
        [hasNativeFS]
      );

     const children = <>
         <label className="text-sm text-gray-400 font-medium pl-3">Thing Description:</label>
         <div className="p-1">
                {offlineTD["title"]}
         </div>
         <div className="p-1 pt-2">
             <label htmlFor="rel" className="text-sm text-gray-400 font-medium pl-2">Relation:</label>
             <input
                list="relationType"
                 type="text"
                 name="rel"
                 id="rel"
                 className="border-gray-600 bg-gray-600 w-full p-2 sm:text-sm border-2 text-white rounded-md focus:outline-none focus:border-blue-500"
                 placeholder="relation name"
             />
              <datalist id="relationType">
                <option value="icon" />
                <option value="service-doc"/>
                <option value="alternate" />
                <option value="type" />
                <option value="tm:extends" />
                <option value="proxy-to" />
                <option value="collection" />
                <option value="item" />
                <option value="predecessor-version" />
                <option value="controlledBy" />
             </datalist>

             <span id="link-rel-info" className="text-xs text-red-400 pl-2"></span>
         </div>
         <div className="p-1 pt-2">
             <label htmlFor="link-href" className="text-sm text-gray-400 font-medium pl-2" >Target ressource:</label>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <button className="text-white font-bold text-sm bg-blue-500 cursor-pointer rounded-md p-2 h-9" disabled={linkingMethod === 'upload'} onClick={()=> { linkingMethodChange("upload"); }}>From local machine</button>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <button className="text-white font-bold text-sm bg-blue-500 cursor-pointer rounded-md p-2 h-9" disabled={linkingMethod === 'url'} onClick={()=> { linkingMethodChange("url"); }}>Ressource url</button>
             <div className="p-1 pt-4" >
             <input
                 type="text"
                 name="link-href"
                 id="link-href"
                 className="border-gray-600 bg-gray-600 w-full p-2 sm:text-sm border-2 text-white rounded-md focus:outline-none focus:border-blue-500"
                 placeholder="The target ressource"
                 onChange={() => { clearHrefErrorMessage(); }}
                 disabled={linkingMethod !== 'url'}
             />
             { linkingMethod === 'upload' &&  <button  className="text-white bg-blue-500 cursor-pointer rounded-md p-2 h-9" onClick={openFile} disabled={linkingMethod !== 'upload'} >
                Open TD
             </button>}
             </div>
             <span id="link-href-info" className="text-xs text-red-400 pl-2"></span>
             <div>
                    <label htmlFor="type" className="text-sm text-gray-400 font-medium pl-2">Type:</label>
                    <input
                         list="mediaType"
                         type="text"
                         name="type"
                         id="type"
                         className="border-gray-600 bg-gray-600 w-full p-2 sm:text-sm border-2 text-white rounded-md focus:outline-none focus:border-blue-500"
                         placeholder="media type"
                    />
                     <datalist id="mediaType">
                        <option value="application/td+json"/>
                        <option value="image/jpeg"/>
                        <option value="text/csv" />
                        <option value="video/mp4" />
                    </datalist>
              </div>
         </div>
     </>
     if (display) {
         return ReactDOM.createPortal(
             <DialogTemplate
                 onCancel={close}
                 onSubmit={() => {
                     let link = {}
                     let linkedTd= {}
                     const rel  = document.getElementById("rel").value;
                     const href = document.getElementById("link-href").value;
                     const type = document.getElementById("type").value;
                     link.href = href !== "" ? href.trim() : "/";
                     let isValidUrl=true
                     try {
                        var url = new URL(href);
                      } catch (_) {
                        isValidUrl= false;
                      }
                     if(linkingMethod==="url" &&isValidUrl&&(url.protocol === "http:" || url.protocol === "https:")){
                        try {
                          var httpRequest = new XMLHttpRequest()
                          httpRequest.open('GET', href, false)
                          httpRequest.send()
                          if(httpRequest.getResponseHeader('content-type')==="application/td+json"){
                                  const thingDescription=httpRequest.response
                                  let parsedTd= JSON.parse(thingDescription)
                                  linkedTd[href]=parsedTd
                          }
                        } catch (ex) {
                        console.log(ex)
                        const msg = "We ran into an error trying to fetch your TD.";
                        console.error(msg, ex);
                        alert(msg);
                      }
                    }
                    else{
                    linkedTd[href]=currentLinkedTd
                    }
                     if(rel !== ""){
                        link.rel=rel.trim()
                    }
                     if(type !== ""){
                         link.type=type.trim()
                     }

                     if (href === "") {
                         showHrefErrorMessage("The href field is mandatory ...");
                     }
                     else if (checkIfLinkExists(link)) {
                        showHrefErrorMessage("A Link with the target Thing Description already exists ...");
                    }
                    else {
                         addLinksToInteraction(link)
                         context.addLinkedTd(linkedTd)
                         setCurrentLinkedTd({})
                         close();
                     }
                 }}

                 submitText={"Add"}
                 children={children}
                 title={`Add Link `}
                 description={`Tell us how this ${offlineTD.title} can interact with other ressources`}
             />,
             document.getElementById("modal-root"));
     }

     return null;
 });

 const showHrefErrorMessage = (msg) => {
     document.getElementById("link-href-info").textContent = msg;
     document.getElementById("link-href").classList.remove("border-gray-600");
     document.getElementById("link-href").classList.add("border-red-400");
 }

 const clearHrefErrorMessage = () => {
     document.getElementById("link-href").classList.add("border-gray-600");
     document.getElementById("link-href").classList.remove("border-red-400");
 }

