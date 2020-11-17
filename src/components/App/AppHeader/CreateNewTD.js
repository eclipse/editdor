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

import * as newTd from './CreateNewTDContent.js';

const swal = require('sweetalert2');

export default async function CreateNewTD() {
    var tdMetadata = {};
    var tdDescription = "";
    var tdSecurity = "";

    return swal.mixin({
        input: 'text',
        backdrop: true,
        reverseButtons: true,
        confirmButtonText: 'Next &rarr;',
        showCancelButton: true,
        progressSteps: ['1', '2', '3']
    }).queue([
        {
            title: 'TD Indentifiers',
            html: newTd.RequestTdMetadata(),
            input: null,
            preConfirm: () => {
                let id = document.getElementById('thing-id').value;
                let title = document.getElementById('thing-title').value;
                let base = document.getElementById('thing-base').value;

                tdMetadata = { id: id, title: title, base: base }
            }
        },
        {
            title: 'TD Description',
            html: newTd.RequestTdDescription(),
            input: null,
            preConfirm: () => {
                tdDescription = document.getElementById('thing-description').value;
            }

        },
        {
            title: 'TD Security',
            html: newTd.RequestTdSecurity(),
            input: null,
            preConfirm: () => {
                tdSecurity = document.getElementById('thing-security').value;
            }

        }
    ]).then((result) => {
        if (result.dismiss) {
            return;
        }

        var thing = {};

        thing["@context"] = "https://www.w3.org/2019/wot/td/v1";
        thing["title"] = tdMetadata.title !== "" ? tdMetadata.title : "ediTDor Thing";
        thing["id"] = tdMetadata.id !== "" ? tdMetadata.id : "urn:editdor-thing-id";

        if (tdMetadata.base !== "") {
            thing["base"] = tdMetadata.base !== "" ? tdMetadata.base : "/";
        }

        if (tdDescription !== "") {
            thing["description"] = tdDescription;
        }

        let securityDefinitions = {};
        securityDefinitions[`${tdSecurity}_sc`] = { scheme: tdSecurity };

        thing["securityDefinitions"] = securityDefinitions;
        thing["security"] = `${tdSecurity}_sc`;

        thing["properties"] = {};
        thing["actions"] = {};
        thing["events"] = {};

        return thing;
    })
}
