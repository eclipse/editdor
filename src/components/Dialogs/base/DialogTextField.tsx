import React from "react";

interface ITextFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const DialogTextField: React.FC<ITextFieldProps> = (props) => {
  return (
    <div key={props.id} className="py-1">
      <label
        htmlFor={props.id}
        className="pl-2 text-sm font-medium text-gray-400"
      >
        {props.label}:
      </label>
      <input
        name={props.id}
        id={props.id}
        className="w-full rounded-md border-2 border-gray-600 bg-gray-600 p-2 text-white focus:border-blue-500 focus:outline-none sm:text-sm"
        placeholder={props.placeholder}
        type={props.type ?? "text"}
        autoFocus={props.autoFocus ?? false}
        onChange={props.onChange}
      />
      <span
        id={`${props.id}-helper-text`}
        className="pl-2 text-xs text-red-400"
      ></span>
    </div>
  );
};

export default DialogTextField;
