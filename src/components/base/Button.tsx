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

interface IButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

const Button: React.FC<IButtonProps> = ({ onClick, children }) => {
  return (
    <button className="min-w-8 text-white hover:opacity-50" onClick={onClick}>
      <div className="flex flex-col items-center justify-center gap-0.5">
        {children}
      </div>
    </button>
  );
};

export default Button;
