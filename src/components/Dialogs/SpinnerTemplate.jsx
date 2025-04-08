import React from "react";
import ReactDOM from "react-dom";

export const SpinnerTemplate = (_) => {
  return ReactDOM.createPortal(
    <div className="bg-transparent-400 absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center text-white">
      <div className="bg-transparent-400 flex max-h-screen w-1/3 flex-col items-center justify-center p-4">
        <div className="justify-center overflow-hidden p-2">
          {showSpinner()}
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

const showSpinner = (_) => {
  return (
    <div className="spinner-container">
      <div className="loading-spinner"></div>
    </div>
  );
};
