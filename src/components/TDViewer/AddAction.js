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


const addAction = () => {
    let action = {};
    return Swal.mixin({
        input: 'text',
        confirmButtonText: 'Next &rarr;',
        showCancelButton: true,
        progressSteps: ['1', '2']
    }).queue([
        {
            title: 'Actiontitle',
            text: 'Please enter a name for your new Action'
        },
        {
            title: 'Add a Form ',
            text: 'Do you want to add a form to your Action?',
            focusConfirm: true,
            confirmButtonText: 'Yes',
            showCancelButton: false,
            showDenyButton: true,
            denyButtonText: 'No',
            input: null
        }
    ]).then((result) => {
        if (!result.dismiss) {
            if (result.value[1]) {
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
                        const resultValue = result.value
                        const propValue = prop.value
                        action = {
                            title: resultValue[0],
                            forms: [
                                {
                                    op: 'invokeaction',
                                    href: propValue[1]
                                }
                            ]
                        }
                        return action
                    }
                    return
                })
            }
                const resultValue = result.value
                if (!resultValue[1]) {
                    action = {
                        title: resultValue[0],
                    }
                }
                return action
            }
            return
    })
}

export default addAction