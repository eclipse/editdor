const READPROPERTY_STRING = 'readproperty';
const WRITEPROPERTY_STRING = 'writeproperty';
const SUBSCRIBEEVENT_STRING = 'subscribeevent';

class WoTLibrary {

    td = {};
    subscriptions = [];

    consumeTD(td) {
        //validate
        this.td = td;
    }

    validate(value, readPropertyType) : Promise<any> {
        if (readPropertyType !== 'object') {
         if((typeof value) === readPropertyType) {
             return Promise.resolve(value);
         } else {
             throw new SyntaxError('Value does not fit to dataschema');
         }
        } else {
            console.log('Object not validated at the moment');
            return Promise.resolve(value);
        }
    }



    async readProperty(propertyName, interactionOptions = {}): Promise<any> {
        //TODO: Check Security
        const propertyToRead = this.td.properties[propertyName];
        const readForm = propertyToRead.forms.find(form => {
            return !form.op.indexOf(READPROPERTY_STRING);
        })

        try {
            const res = await fetch(this.td.base + readForm.href);
            if (res.status === 200) {
                const result = await res.json();
                return  this.validate(result.value, propertyToRead.type)
            } else {
                return Promise.reject('Error: ' + res.statusText)
            }
        } catch (e) {
            console.log(e);
        }
    }

    async writeProperty(propertyName, value, interactionOptions = {}): Promise<any> {
        const writeProperty = this.td.properties[propertyName];
        const writeForm = writeProperty.forms.find(form => {
            let search
            if (Array.isArray(form.op)) {
                search = form.op.join(',');
            } else {
                search = form.op;
            }
            return search.indexOf(WRITEPROPERTY_STRING) !== -1;
        });

        if(!writeForm) {
            Promise.reject(new SyntaxError('no writeForm Found'))
        }

        let val;
        try {
            val = await this.validate(value, writeProperty.type)
            }
        catch
            (e) {
            return Promise.reject(e)
        }


        const data = {value: val}
        try {
            //TODO: Check if this is set ('htv:methodName','contentType')
            console.log('witeForm',writeForm)
            const res = await fetch(this.td.base + writeForm.href, {
                    method: writeForm['htv:methodName'],
                    cache: 'no-cache',
                    headers: {
                        'Content-Type': writeForm.contentType
                    },
                    body: this.encodeBody(data, writeForm.contentType)
                }
            );
            const resTemp = await res.json();
            console.log('writeResponse', resTemp);
            return Promise.resolve(resTemp)
        } catch (e) {
            console.log(e);
            Promise.reject();
        }
    }

    encodeBody(data, encoding = 'application/json') {

        if (encoding === 'application/x-www-form-urlencoded') {
            let formBody = [];
            for (const property in data) {
                const encodedKey = encodeURIComponent(property);
                const encodedValue = encodeURIComponent(data[property]);
                formBody.push(encodedKey + "=" + encodedValue);
            }
            formBody = formBody.join("&");
            return formBody
        } else {
            console.log('No contentType found in Form so default will be used.')
            return JSON.stringify(data);
        }
    }

    async observeProperty(propertyName, callbackFunction, InteractionOptions = {}) : Promise<boolean> {
        const observeProperty = this.td.events['cov'];
        const observeForm = observeProperty.forms.find(form => {
            return !form.op.indexOf(SUBSCRIBEEVENT_STRING);
        });
        if (!observeForm) {
            return
        }
        const ws = await this.getOrCreateSubscription();
        ws.onopen = () => {
            console.log('Websocket has been opened');
        }
        ws.callbacks[propertyName] = callbackFunction;
        ws.onmessage = (message) => {
            let parsedMessage = {};
            try {
                parsedMessage = JSON.parse(message.data);
            } catch (e) {
                console.log(e)
            }
            if (parsedMessage.type === 'cov') {
                Object.keys(ws.callbacks).forEach(propName => {
                    if (!Array.isArray(parsedMessage.data) && parsedMessage.data.id.indexOf(propName) !== -1) {
                        console.log('received message over websocket', parsedMessage)
                        ws.callbacks[propName](parsedMessage)
                    }
                })
            }
        }
        return Promise.resolve(true)
    }

    unobserveProperty(propertyName) : Promise<boolean>{
        const observeProperty = this.td.events['cov'];
        const observeForm = observeProperty.forms.find(form => {
            return !form.op.indexOf(SUBSCRIBEEVENT_STRING);
        });
        if (!observeForm) {
            return
        }
        let returnedSubscription = this.subscriptions.find(subscription => {
            return subscription.url.startsWith('ws://localhost:8080/.subscriptions')
        })
        delete returnedSubscription.callbacks[propertyName]

        if (Object.keys(returnedSubscription.callbacks).length === 0 ) {
            returnedSubscription.close()
        }
        this.subscriptions = this.subscriptions.filter(sub => {
            return sub.url !== returnedSubscription.url;
        })

        return Promise.resolve(true)
    }

    async getOrCreateSubscription() {
        let returnedSubscription = this.getSubscription()
        if (!returnedSubscription) {
            const sub = await fetch(this.td.base + '/.subscriptions?all=true', {
                method: 'POST'
            })
            const subJSON = await sub.json()
            returnedSubscription = new WebSocket('ws://localhost:8080' + subJSON.link.filter(x => x.rel === 'ws')[0].href);
            returnedSubscription.callbacks = {};
            this.subscriptions.push(returnedSubscription)
        }
        return returnedSubscription;
    }

    getSubscription() {
        return this.subscriptions.find(subscription => {
            return subscription.url.startsWith('ws://localhost:8080/.subscriptions')
        });
    }
}

export default WoTLibrary;
