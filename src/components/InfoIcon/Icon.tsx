import React from "react";
import { Tooltip } from "react-tooltip";

interface IIconProps {
  html: string;
  id: string;
  IconComponent: React.ElementType;
}

const Icon: React.FC<IIconProps> = (props) => {
  return (
    <>
      <a data-tooltip-id={props.id} data-tooltip-html={props.html}>
        <props.IconComponent color="grey" size="16" />
      </a>
      <Tooltip id={props.id} place="top" className="z-10" />
    </>
  );
};

export default Icon;
