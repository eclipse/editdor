/********************************************************************************
 * Copyright (c) 2025 Contributors to the Eclipse Foundation
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0, or the W3C Software Notice and
 *
 * SPDX-License-Identifier: EPL-2.0 OR W3C-20150513
 ********************************************************************************/
import React from "react";
import Icon from "./Icon";
import { Info } from "react-feather";

/**
 * Display an info icon that shows a information text when hovered
 * next to the child.
 *
 * The parameter tooltip a TooltipContent object containing HTML on how
 * the tooltip is rendered and a link that gets called onClick.
 * @param {TooltipContent} tooltip
 * @param {Object} children
 */
interface IInfoIconWrapperProps {
  tooltip: { html: string; href: string };
  children?: React.ReactNode;
  id: string;
  className?: string;
}

const InfoIconWrapper: React.FC<IInfoIconWrapperProps> = (props) => {
  const isHrefEmpty = !props.tooltip.href || props.tooltip.href.trim() === "";
  const containerClass =
    !props.className || props.className.trim() === ""
      ? `flex ${props.className}`
      : "flex justify-center";

  return (
    <div className={containerClass}>
      <div className="pr-0.5">{props.children}</div>
      <button
        onClick={() =>
          !isHrefEmpty && window.open(props.tooltip.href, "_blank")
        }
        disabled={isHrefEmpty}
      >
        <Icon
          html={props.tooltip.html || "No tooltip content available"}
          id={props.id}
          IconComponent={Info}
        />
      </button>
      <div className="p-1"></div>
    </div>
  );
};

export default InfoIconWrapper;
