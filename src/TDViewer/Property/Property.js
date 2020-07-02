import React from "react";
import './Property.css'

class Property extends React.Component {

    findOperations() {
        let ops = this.props.prop.forms.map(form => {
            return form.op;
        })
        ops = [...new Set(ops)]
        return ops;
    }

    async writeProp(e) {
        const writeForm = this.props.prop.forms.find(form => {
            if (form.op.indexOf('writeproperty')) {
                return false;
            } else {
                return true;
            }
        });
        console.log(writeForm)
        const data = {value: document.getElementById(this.props.propName + 'write').value}
        try {
            console.log(writeForm['htv:methodName']);
            const res = await fetch(this.props.base + writeForm.href, {
                    method: writeForm['htv:methodName'],
                    cache: 'no-cache',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }
            );
            const resTemp = await res.json();
            console.log(resTemp);
        } catch (e) {
            console.log(e);
            alert('while writing the value an error ocurred');
        }


    }

    async readProp(e) {
        const readForm = this.props.prop.forms.find(form => {
            if (form.op.indexOf('readproperty')) {
                return false;
            } else {
                return true;
            }
        })

        const res = await fetch(this.props.base + readForm.href);
        const resJSON = await res.json();
        document.getElementById(this.props.propName + 'propertyLog').value = JSON.stringify(resJSON)

    }

    render() {
        const property = this.props.prop;

        const labels = this.findOperations().toString()

        return (
            <div>
                <details className="title">
                    <summary>{this.props.propName} {labels}</summary>
                    <div className="propertyContainer">
                        {property.title && <p>Title: {property.title}</p>}
                        <div className="container">
                            <label htmlFor="write">
                                Write:
                            </label>
                            <input type="text" id={this.props.propName + "write"}/>
                            <button onClick={event => this.writeProp(event)}>write</button>
                        </div>
                        <div className="container">
                            <button onClick={event => this.readProp(event)}>read</button>
                            <button>observe</button>
                            <button>unobserve</button>
                        </div>
                        <div className="container">
                            <textarea name="propertyLog" id={this.props.propName + "propertyLog"} cols="30" rows="10"
                                      placeholder="this is the log and will be filled when you press a button"/>
                        </div>
                    </div>
                </details>
            </div>
        )
    }
}

export default Property;
