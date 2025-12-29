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
import React, { createContext, useContext, ReactNode, Children } from "react";
import { twMerge } from "tailwind-merge";

interface ProgressContextType {
  percent: number;
  stepCount: number;
  currentIndex: number;
}

const ProgressContext = createContext<ProgressContextType>({
  percent: 0,
  stepCount: 0,
  currentIndex: 0,
});

interface ProgressBarProps {
  percent: number;
  filledBackground?: string;
  children: ReactNode;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  filledBackground = "linear-gradient(to right, #A8B988, #B5D7BD)",
  children,
  className,
}) => {
  const childrenArray = Children.toArray(children);
  const stepCount = childrenArray.length;
  const currentIndex = Math.floor((percent / 100) * stepCount);

  const childrenWithIndices = Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { stepIndex: index } as any);
    }
    return child;
  });

  return (
    <ProgressContext.Provider value={{ percent, stepCount, currentIndex }}>
      <div className={twMerge("relative mb-6 h-8 w-full", className)}>
        <div className="absolute left-0 top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-gray-200"></div>
        <div
          className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full transition-all duration-300 ease-in-out"
          style={{
            width: `${percent}%`,
            background: filledBackground,
          }}
        ></div>

        <div className="absolute left-0 top-0 flex w-full items-center justify-between">
          {childrenWithIndices}
        </div>
      </div>
    </ProgressContext.Provider>
  );
};

interface StepProps {
  children: (props: { accomplished: boolean; index: number }) => ReactNode;
  transition?: string;
  className?: string;
  stepIndex?: number;
}

export const Step: React.FC<StepProps> = ({
  children,
  transition = "scale",
  className,
  stepIndex = 0,
}) => {
  const { currentIndex } = useContext(ProgressContext);

  const accomplished = stepIndex <= currentIndex;

  const scaleClass =
    transition === "scale" && accomplished ? "scale-110" : "scale-100";

  return (
    <div
      data-step={stepIndex}
      className={twMerge("transition-all duration-300", scaleClass, className)}
    >
      {children({ accomplished, index: stepIndex })}
    </div>
  );
};
