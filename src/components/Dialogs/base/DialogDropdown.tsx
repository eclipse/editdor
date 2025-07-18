import { ChevronDown } from "react-feather";
import React from "react";

interface IDropdownProps {
  id: string;
  label: string;
  options: string[];
  className?: string;
}

const DialogDropdown: React.FC<IDropdownProps> = (props) => {
  return (
    <>
      <label
        htmlFor={props.id}
        className="pl-2 text-sm font-medium text-gray-400"
      >
        {props.label}:
      </label>
      <div className={`relative ${props.className ?? ""} `}>
        <select
          className="block w-full appearance-none rounded border-2 border-gray-600 bg-gray-600 px-4 py-3 pr-8 leading-tight text-white focus:border-blue-500 focus:outline-none"
          id={props.id}
        >
          {props.options.map((e) => {
            return <option key={e}>{e}</option>;
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <ChevronDown color="#cacaca"></ChevronDown>
        </div>
      </div>
    </>
  );
};
export default DialogDropdown;
