import React, { useContext } from 'react';
import ediTDorContext from '../../context/ediTDorContext';

const AppFooter = (props) => {
    const context = useContext(ediTDorContext);
    let megaBytes = 0
    let propertiesCount = 0
    let actionsCount = 0
    let eventsCount = 0
    try {
        const parse = JSON.parse(context.offlineTD)
        const size = new TextEncoder().encode(JSON.stringify(parse)).length
        const kiloBytes = size / 1024;
        megaBytes = kiloBytes / 1024;
        propertiesCount = parse.properties ? Object.keys(parse.properties).length : 0
        actionsCount = parse.properties ? Object.keys(parse.actions).length : 0
        eventsCount = parse.properties ? Object.keys(parse.events).length : 0
    }
    catch (e) {
        console.log(e)
    }
    return (<>
        <footer className="footer relative bg-blue-500 h-8 flex flex-col items-center justify-between text-white">
            <div className="flex flex-row items-center justify-start w-full">
                <div className="mx-2">Properties: {propertiesCount}</div>
                <div className="mx-2">Actions: {actionsCount}</div>
                <div className="mx-2">Events: {eventsCount}</div>
                <div className="mx-2 flex-grow">Size: {megaBytes} MB</div>
                <div className="mx-2 justify-self-end">Version: {process.env.REACT_APP_NPM_PACKAGE_VERSION} </div>
            </div>
        </footer>
    </>
    );
}
export default AppFooter