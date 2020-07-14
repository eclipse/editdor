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
        await this.props.wot.writeProperty(this.props.propName, document.getElementById(this.props.propName + "write").value)
    }

    async readProp(e) {
        document.getElementById(this.props.propName + "propertyLog").value = JSON.stringify(await this.props.wot.readProperty(this.props.propName));
    }

    render() {
        const property = this.props.prop;

        const labels = this.findOperations().toString()

        const writeContainer = () => {
            if (labels.indexOf('writeproperty') !== -1) {
                return (<div className="container">
                    <label htmlFor="write">
                        Write:
                    </label>
                    <input type={this.props.prop.type} id={this.props.propName + "write"} className="writeInput"/>
                    <button onClick={event => this.writeProp(event)}>write</button>
                </div>)
            }
        }

        return (
            <div>
                <details className="title">
                    <summary>{this.props.propName} {labels}</summary>
                    <div className="propertyContainer">
                        {property.title && <p>Title: {property.title}</p>}
                        {writeContainer()}
                        <div className="container">
                            <button onClick={event => this.readProp(event)}>read</button>
                            <button onClick={event => this.observeProp(event)}>observe</button>
                            <button onClick={event => this.unobserveProp(event)}>unobserve</button>
                        </div>
                        <div className="container">
                            <textarea disabled name="propertyLog" id={this.props.propName + "propertyLog"} cols="30" rows="10"
                                      placeholder="this is the log and will be filled when you press a button"
                                      className="logArea"/>
                        </div>
                    </div>
                </details>
            </div>
        )
    }

    async observeProp(event) {
        await this.props.wot.observeProperty(this.props.propName, (res) => {
            document.getElementById(this.props.propName + "propertyLog").value += JSON.stringify(res);
        });
    }

    async unobserveProp(event) {
        await this.props.wot.unobserveProperty(this.props.propName);
    }
}

export default Property;
