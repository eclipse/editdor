import React from "react";

interface IButtonProps {
  id?: string;
  text: string | React.ReactNode;
  onClick: () => void;
  className?: string;
}

const Button: React.FC<IButtonProps> = ({ id, text, onClick, className }) => {
  return (
    <button
      id={id}
      className={`rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600 ${className}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default Button;
