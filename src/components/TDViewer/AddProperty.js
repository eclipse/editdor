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


const addProperty = async () => {
    let property = {};
    return Swal.mixin({
        input: 'text',
        confirmButtonText: 'Next &rarr;',
        showCancelButton: true,
        progressSteps: ['1', '2', '3']
    }).queue([
        {
            title: 'Propertytitle',
            text: 'Please enter a name for your new Property'
        },
        {
            title: 'Propertytype',
            text: 'Please enter a type for your new Property',
            input: 'select',
            inputOptions: {
                number: 'number',
                integer: 'integer',
                boolean: 'boolean',
                string: 'string',
                object: 'object',
                array: 'array',
            },
            inputPlaceholder: 'Select a type',
        },
        {
            title: 'Add a Form ',
            text: 'Do you want to add a form to your Property?',
            focusConfirm: true,
            confirmButtonText: 'Yes',
            showCancelButton: false,
            showDenyButton: true,
            denyButtonText: 'No',
            input: null,
        }
    ]).then((result) => {
        if (!result.dismiss) {
            if (result.value[2]) {
                return Swal.mixin({
                    title: 'Add Form',
                    confirmButtonText: 'Next &rarr;',
                    showCancelButton: true,
                    progressSteps: ['1', '2']
                }).queue([
                    {
                        text: 'Select an Operation or multiple Operations',
                        html: operationsSelections('properties'),
                        preConfirm: () => {
                            const operations = ['1', '2', '3', '4'].map(x => {
                                return document.getElementById('checkbox' + x).checked ? document.getElementById('checkbox' + x).value : undefined
                            }).filter(y => y !== undefined);
                            result.value[3] = operations
                        }
                    },
                    {
                        input: 'text',
                        title: 'Form Href',
                        text: 'Please enter a href where your Property is reachable'
                    }
                ]).then((prop) => {
                    if (!prop.dismiss) {
                        const propValue = prop.value
                        const resultValue = result.value
                        property = {
                            title: resultValue[0],
                            type: resultValue[1],
                            forms: [
                                {
                                    op: resultValue[3],
                                    href: propValue[1]
                                }
                            ]
                        }  
                        return property 
                    }
                    return 
                })
            }
            const resultValue = result.value
            if (!result[2]) {
                property = {
                    title: resultValue[0],
                    type: resultValue[1]
                }
            }
            console.log(`Property`, property)
            return property
        }
        return
    })
}

export default addProperty;