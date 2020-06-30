import React from 'react';
import './TDViewer.css';
import Property from './Properties/Property'

class TDViewer extends React.Component {

    render() {
        let properties;
        if (this.props.td.properties) {
            properties = Object.keys(this.props.td.properties).map((key, index) => {
                return (<Property prop={this.props.td.properties[key]} propName={key} />);
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
                    <h1>TD Viewer</h1>
                    <div className="metaData">
                        <p>{JSON.stringify(metaData)}</p>
                    </div>
                    <hr/>
                    <h2>Properties</h2>
                    {properties}
                </div>
            )
        } else {
            return (
                <div>
                    <h1>unable to load TD please check URL</h1>
                </div>
            )
        }
    }
}
export default TDViewer;
