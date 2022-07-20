import { ChevronDown, ChevronRight } from "react-feather";
import ediTDorContext from "../../../context/ediTDorContext";
import React from "react";

export const AdvancedOptions = ({ changeUrl }) => {
  const context = React.useContext(ediTDorContext);
  const [showUrl, setShowUrl] = React.useState(false);
  const show = () => {
    setShowUrl(!showUrl);
  };
  return (
    <>
      <div
        className="flex align-top my-1"
        onClick={() => show()}
      >
        <div className="relative cursor-pointer border-none py-3 px-4 pr-8  align-middle">
          <h4 className="whitespace-nowrap text-gray-400">
            Advanced Options
          </h4>
          <div className="pointer-events-none absolute items-center inset-y-0 right-0 flex px-2 text-gray-700">
            {showUrl === true ? (
              <ChevronDown color="#cacaca" />
            ) : (
              <ChevronRight color="#cacaca" />
            )}
          </div>
        </div>
      </div>
      {showUrl && (
        <div>
          <label className="text-sm text-gray-400 font-medium pl-2">
            TM Repository:
          </label>
          <div className="flex w-fill my-1 ml-2">
            <input
              name="remote-url"
              id="remote-url"
              className="border-gray-600 bg-gray-600 w-full p-2 sm:text-sm border-2 text-white rounded-md focus:outline-none focus:border-blue-500"
              defaultValue={context.tmRepositoryUrl}
              type="url"
            />
            <button
              type="submit"
              className="text-white bg-blue-500 p-2 rounded-md"
              onClick={() => {
                changeUrl();
              }}
            >
              Change
            </button>
          </div>
        </div>
      )}
    </>
  );
};
