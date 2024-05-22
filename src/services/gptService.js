/**
 * 
 * @param {string} description 
 * @returns 
 */
const sendRequest = async (description) => {
    try {
        const res = await fetch(process.env.REACT_APP_OPENAI_URI,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "api-key": process.env.REACT_APP_OPENAI_KEY
                },
                body: JSON.stringify({
                    "prompt": description,
                    "max_tokens": 4000,
                    "temperature": 1,
                    "frequency_penalty": 0,
                    "presence_penalty": 0,
                    "top_p": 1,
                    "best_of": 1,
                    "stop": null
                }),
            }
        );
        
        if (res.status !== 200) {
            return "An error occured. Try sending your message again."
        }

        const body = await res.json();
        return body.choices[0].text;
    } catch (error) {
        console.error(error);
        return "An error occured. Try sending your message again."
    }
}

export { sendRequest };