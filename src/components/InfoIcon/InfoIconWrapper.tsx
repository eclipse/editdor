/********************************************************************************
 * Copyright (c) 2018 Contributors to the Eclipse Foundation
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
import PropTypes from "prop-types";
import { Info } from "react-feather";
import { Tooltip } from "react-tooltip";

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
}

const InfoIconWrapper: React.FC<IInfoIconWrapperProps> = (props) => {
  return (
    <div className="flex justify-center">
      <div className="pr-0.5">{props.children}</div>
      <button onClick={() => window.open(props.tooltip.href, "_blank")}>
        <InfoIcon
          html={props.tooltip.html || "No tooltip content available"}
          id={props.id}
        />
      </button>
      <div className="p-1"></div>
    </div>
  );
};

InfoIconWrapper.propTypes = {
  tooltip: PropTypes.shape({
    html: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
  }).isRequired,
  children: PropTypes.any,
  id: PropTypes.string.isRequired,
};

interface IInfoIconProps {
  html: string;
  id: string;
}
/**
 * Display an info icon that shows a information text when hovered.
 *
 * The parameter html is a String containing HTML for the tooltips layout.
 * @param {String} html
 */
export const InfoIcon: React.FC<IInfoIconProps> = (props) => {
  return (
    <>
      <a data-tooltip-id={props.id} data-tooltip-html={props.html}>
        <Info color="grey" size="16" />
      </a>
      <Tooltip id={props.id} place="top" className="z-10" />
    </>
  );
};

InfoIcon.propTypes = {
  html: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

export default InfoIconWrapper;
