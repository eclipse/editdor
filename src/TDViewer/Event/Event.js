import React from "react";
import './Event.css'
class Event extends React.Component {
    render() {
        return (
            <div>
            <details>
                <summary>{this.props.eventName} </summary>
                <p>{JSON.stringify(this.props.event)}</p>
            </details>
            </div>
        )
    }
}

export default Event;
