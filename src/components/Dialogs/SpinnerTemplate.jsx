import React from 'react';
import ReactDOM from "react-dom";

export const SpinnerTemplate = _ => {

    return ReactDOM.createPortal(
        <div
            className="flex bg-transparent-400 w-full h-full absolute top-0 left-0 justify-center items-center z-10 text-white">
            <div className="bg-transparent-400 w-1/3 flex flex-col justify-center items-center p-4 max-h-screen">

                <div className="justify-center overflow-hidden p-2">
                    {showSpinner()}
                </div>

            </div>
        </div>,
        document.getElementById("modal-root")
    );

};

const showSpinner = _ => {
    return (<div className="spinner-container">
        <div className="loading-spinner">
        </div>
    </div>);
}