import React from "react";
import { Tooltip } from "react-tooltip";

interface IIconProps {
  html: string;
  id: string;
  size?: number;
  color?: string;
  className?: string;
  IconComponent: React.ElementType;
}

const Icon: React.FC<IIconProps> = (props) => {
  return (
    <>
      <a
        data-tooltip-id={props.id}
        data-tooltip-html={props.html}
        className={props.className}
      >
        <props.IconComponent
          color={props.color ?? "grey"}
          size={props.size ?? "16"}
        />
      </a>
      <Tooltip id={props.id} place="top" className="z-10" />
    </>
  );
};

export default Icon;
