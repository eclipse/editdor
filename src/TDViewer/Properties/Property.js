import React from "react";
import './Property.css'
class Property extends React.Component {
    render() {
        return (
            <div>
            <details>
                <summary>{this.props.propName} </summary>
                <p>{JSON.stringify(this.props.prop)}</p>
            </details>
            </div>
        )
    }
}

export default Property;
