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
