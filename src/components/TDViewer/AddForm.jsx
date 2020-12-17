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
import operationsSelections from './OperationsSelections';
const Swal = require('sweetalert2')

const addGlobalForm = () => {
    let form = {};
    return Swal.mixin({
        title: 'Add Form',
        confirmButtonText: 'Next &rarr;',
        showCancelButton: true,
        progressSteps: ['1', '2']
    }).queue([
        {
            text: 'Select an Operation or multiple Operations',
            html: operationsSelections('forms'),
            preConfirm: () => {
                const operations = ['1', '2', '3', '4'].map(x => {
                    return document.getElementById('checkbox' + x).checked ? document.getElementById('checkbox' + x).value : undefined
                }).filter(y => y !== undefined);
                form.op = operations
            }
        },
        {
            input: 'text',
            title: 'Form Href',
            text: 'Please enter a href where your Form is reachable'
        }
    ]).then((prop) => {
        if (!prop.dismiss) {
            const propValue = prop.value
            form.href =  propValue[1]
            return form
        }
        return
    })
}

export default addGlobalForm;