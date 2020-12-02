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
const Swal = require('sweetalert2')


const addActionForm = async () => {
    let form = {};
    return Swal.mixin({
        title: 'Add Form',
        confirmButtonText: 'Next &rarr;',
        showCancelButton: true,
        progressSteps: ['1']
    }).queue([
        {
            input: 'text',
            title: 'Form Href',
            text: 'Please enter a href where your Action is reachable'
        }
    ]).then((prop) => {
        if (!prop.dismiss) {
            const propValue = prop.value
             form.href =  propValue[0]
             form.op = "invokeaction"
            return form
        }
        return
    })
}

export default addActionForm;