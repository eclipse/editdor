import React from "react";
import './Action.css'
class Action extends React.Component {
    render() {
        return (
            <div>
            <details>
                <summary>{this.props.actionName} </summary>
                <p>{JSON.stringify(this.props.action)}</p>
            </details>
            </div>
        )
    }
}

export default Action;
