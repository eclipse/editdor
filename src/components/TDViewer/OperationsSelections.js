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
const operationsSelections = (type) => {
    switch (type) {
        case 'properties':
            return `<div class="form-check">
                        <input class="form-check-input" type="checkbox" value="writeproperty" id="checkbox1">
                        <label class="form-check-label" for="checkbox1">
                        writeproperty
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="readproperty" id="checkbox2">
                        <label class="form-check-label" for="checkbox2">
                        readproperty
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="observeproperty" id="checkbox3">
                        <label class="form-check-label" for="checkbox3">
                        observeproperty
                    </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="unobserveproperty" id="checkbox4">
                        <label class="form-check-label" for="checkbox4">
                        unobserveproperty
                        </label>
                    </div>`;
        case 'events':
            return `<div class="form-check">
                        <input class="form-check-input" type="checkbox" value="subscribeevent" id="checkbox1">
                        <label class="form-check-label" for="checkbox1">
                        subscribeevent
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="unsubscribeevent" id="checkbox2">
                        <label class="form-check-label" for="checkbox2">
                        unsubscribeevent
                        </label>
                    </div>`;
        case 'forms':
            return `<div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="writeallproperties" id="checkbox1">
                                    <label class="form-check-label" for="checkbox1">
                                    writeallproperties
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="readallproperties" id="checkbox2">
                                    <label class="form-check-label" for="checkbox2">
                                    readallproperties
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="writemultipleproperties" id="checkbox3">
                                    <label class="form-check-label" for="checkbox3">
                                    writemultipleproperties
                                </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="readmultipleproperties" id="checkbox4">
                                    <label class="form-check-label" for="checkbox4">
                                    readmultipleproperties
                                    </label>
                                </div>`;
        default:
            return ''
    }


};

export default operationsSelections;