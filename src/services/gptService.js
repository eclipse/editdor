/********************************************************************************
 * Copyright (c) 2018 - 2024 Contributors to the Eclipse Foundation
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

/**
 *
 * @param {string} description
 * @returns
 */
const sendRequest = async (description) => {
	try {
		const res = await fetch(process.env.REACT_APP_OPENAI_URI, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"api-key": process.env.REACT_APP_OPENAI_KEY,
			},
			body: JSON.stringify({
				prompt: description,
				max_tokens: 4000,
				temperature: 1,
				frequency_penalty: 0,
				presence_penalty: 0,
				top_p: 1,
				best_of: 1,
				stop: null,
			}),
		});

		if (res.status !== 200) {
			return "An error occured. Try sending your message again.";
		}

		const body = await res.json();
		return body.choices[0].text;
	} catch (error) {
		console.error(error);
		return "An error occured. Try sending your message again.";
	}
};

export { sendRequest };
