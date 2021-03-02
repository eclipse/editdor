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
        megaBytes = formatByteSize(size);
        propertiesCount = parse.properties ? Object.keys(parse.properties).length : 0
        actionsCount = parse.properties ? Object.keys(parse.actions).length : 0
        eventsCount = parse.properties ? Object.keys(parse.events).length : 0
    }
    catch (e) {
        console.log(e)
    }
    return (<>
        <footer className="bg-blue-500 h-8 flex flex-col items-center justify-center text-white">
            <div className="flex flex-row items-center justify-start w-full">
                <div className="mx-2">Properties: {propertiesCount}</div>
                <div className="mx-2">Actions: {actionsCount}</div>
                <div className="mx-2">Events: {eventsCount}</div>
                <div className="mx-2 flex-grow">Size: {megaBytes}</div>
                <div className="mx-2 justify-self-end">Version: {process.env.REACT_APP_NPM_PACKAGE_VERSION} | <u><a href="https://github.com/eclipse/editdor" target="_blank" rel="noopener noreferrer">We are on GitHub</a></u></div>
            </div>
        </footer>
    </>
    );
}

function formatByteSize(bytes) {
    if(bytes < 1024) return bytes + " bytes";
    else if(bytes < 1048576) return(bytes / 1024).toFixed(3) + " KiB";
    else if(bytes < 1073741824) return(bytes / 1048576).toFixed(3) + " MiB";
    else return(bytes / 1073741824).toFixed(3) + " GiB";
};


export default AppFooter