import React from 'react';
import './TDViewer.css';
import Property from './Property/Property'
import Action from './Action/Action'
import Event from './Event/Event'

class TDViewer extends React.Component {

    render() {
        console.log('TD in TDViewer', this.props.td.properties)
        let properties;
        if (this.props.td.properties) {
            properties = Object.keys(this.props.td.properties).map((key, index) => {
                return (<Property base={this.props.td.base} prop={this.props.td.properties[key]} propName={key} key={index}/>);
            });
        }
        let actions;
        if (this.props.td.actions) {
            actions = Object.keys(this.props.td.actions).map((key, index) => {
                return (<Action action={this.props.td.actions[key]} actionName={key} key={index}/>);
            });
        }
        let events;
        if (this.props.td.events) {
            events = Object.keys(this.props.td.events).map((key, index) => {
                return (<Event event={this.props.td.events[key]} eventName={key} key={index}/>);
            });
        }

        let metaData;
        //Needs to be parsed in a sufficient way.
        metaData = this.props.td;
        delete metaData['properties'];
        delete metaData['actions'];
        delete metaData['events'];


        if (this.props.td) {
            return (
                <div className="TDViewer">
                    <h1>{metaData.title}</h1>
                    <div className="metaData">
                        <p>ID: {metaData.id}</p>
                        <p>Context: {JSON.stringify(metaData['@context'])}</p>
                    </div>

                    <hr/>
                    <div className="listContainer">
                        <h2>Properties</h2>
                        {properties}
                    </div>

                    <hr/>
                    <div className="listContainer">
                        <h2>Actions</h2>
                        {actions}
                    </div>
                    <hr/>
                    <div className="listContainer">
                        <h2>Events</h2>
                        {events}
                    </div>

                </div>
            )
        } else {
            return (
                <div>
                    <h1>unable to load TD please enter URL</h1>
                </div>
            )
        }
    }
}

export default TDViewer;
