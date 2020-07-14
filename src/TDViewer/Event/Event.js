import React from "react";
import './Event.css'
class Event extends React.Component {

    findOperations() {
        let ops = this.props.event.forms.map(form => {
            return form.op;
        })
        ops = [...new Set(ops)]
        return ops;
    }

    render() {
        const event = this.props.event;

        const labels = this.findOperations().toString()

        return (
            <div>
            <details>
                <summary>{this.props.eventName} {labels}</summary>
                <div className="eventContainer">
                    {event.title && <p>Title: {event.title}</p>}
                    <div className="container">
                        <button>subscribe</button>
                        <button>unsubscribe</button>
                    </div>
                    <div className="container">
                            <textarea name="propertyLog" id={this.props.eventName + "propertyLog"} cols="30" rows="10"
                                      placeholder="this is the log and will be filled when you press a button" className="logArea"/>
                    </div>
                </div>
            </details>
            </div>
        )
    }
}

export default Event;
