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
import DialogTextField from "./DialogTextField";
import BaseButton from "../../TDViewer/base/BaseButton";
import { AlertTriangle, Check, RefreshCw } from "react-feather";
import InfoIconWrapper from "../../InfoIcon/InfoIconWrapper";
import { getValidateTMContent } from "../../InfoIcon/TooltipMapper";

interface IFormMetadataProps {
  model: string;
  onChangeModel: (event: React.ChangeEvent<HTMLInputElement>) => void;
  author: string;
  onChangeAuthor: (event: React.ChangeEvent<HTMLInputElement>) => void;
  manufacturer: string;
  onChangeManufacturer: (event: React.ChangeEvent<HTMLInputElement>) => void;
  license: string;
  onChangeLicense: (event: React.ChangeEvent<HTMLInputElement>) => void;
  copyrightYear: string;
  onChangeCopyrightYear: (event: React.ChangeEvent<HTMLInputElement>) => void;
  holder: string;
  onChangeHolder: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClickCatalogValidation: () => void;
  onClickCopyThingModel: () => void;
  isValidating: boolean;
  isValid: boolean;
  errorMessage: string;
  copied: boolean;
}
const FormMetadata: React.FC<IFormMetadataProps> = ({
  model,
  onChangeModel,
  author,
  onChangeAuthor,
  manufacturer,
  onChangeManufacturer,
  license,
  onChangeLicense,
  copyrightYear,
  onChangeCopyrightYear,
  holder,
  onChangeHolder,
  onClickCatalogValidation,
  onClickCopyThingModel,
  isValidating,
  isValid,
  errorMessage,
  copied,
}) => {
  return (
    <>
      <div className="w-full rounded-md bg-black bg-opacity-80 p-2">
        <h1 className="font-bold">
          The following fields will be added in the background to your TM for
          cataloging purposes to ensure quality and discoverability of Thing
          Models.
        </h1>
        <div className="mx-auto w-[70%] flex-col px-4">
          <DialogTextField
            label="Model*"
            placeholder="The Manufacturer Part Number (MPN) of the product, or the product to which the offer refers."
            id="model"
            type="text"
            value={model}
            onChange={onChangeModel}
            autoFocus={true}
          />
          <DialogTextField
            label="Author*"
            placeholder="The organization writing the TM"
            id="author"
            type="text"
            value={author}
            onChange={onChangeAuthor}
            autoFocus={false}
          />
          <DialogTextField
            label="Manufacturer*"
            placeholder="Manufacturer of the device"
            id="manufacturer"
            type="text"
            value={manufacturer}
            onChange={onChangeManufacturer}
            autoFocus={false}
          />
          <DialogTextField
            label="License"
            placeholder="URL of the license, e.g., https://www.apache.org/licenses/LICENSE-2.0.txt"
            id="license"
            type="text"
            value={license}
            onChange={onChangeLicense}
            autoFocus={false}
          />
          <DialogTextField
            label="Copyright Year"
            placeholder="e.g. 2024..."
            id="copyright"
            type="text"
            value={copyrightYear}
            onChange={onChangeCopyrightYear}
            autoFocus={false}
          />
          <DialogTextField
            label="Copyright Holder"
            placeholder="Organization holding the copyright of the TM..."
            id="holder"
            type="text"
            value={holder}
            onChange={onChangeHolder}
            autoFocus={false}
          />
          <div className="flex flex-row justify-end">
            <div className="my-2 mt-6 flex flex-grow justify-end">
              <InfoIconWrapper
                tooltip={getValidateTMContent()}
                id="validateTMContent"
                className="justify-center"
              />
            </div>
            <BaseButton
              id="catalogValidation"
              onClick={onClickCatalogValidation}
              variant="primary"
              type="button"
              className="my-2 mt-6 w-1/4"
            >
              <div className="flex w-full items-center justify-center">
                {isValidating ? (
                  <>
                    <span className="pl-6">Validating</span>
                    <RefreshCw className="animate-spin" size={20} />
                  </>
                ) : (
                  <>
                    <span className="pl-6">Validate</span>
                  </>
                )}
              </div>
            </BaseButton>
          </div>
        </div>

        <div>
          {errorMessage && (
            <div className="mb-2 mt-2 h-full w-full rounded bg-red-500 p-1 text-white">
              <AlertTriangle size={16} className="mr-1 inline" />
              {errorMessage}
            </div>
          )}
          {isValid && (
            <>
              <div className="flex flex-col">
                <div className="m-2 inline rounded bg-green-500 p-2 text-white">
                  <Check size={16} className="mr-1 inline" />
                  {"TM is valid"}
                </div>
                <div>
                  <BaseButton
                    id="copyThingModel"
                    onClick={onClickCopyThingModel}
                    variant="primary"
                    type="button"
                    className="mx-2 my-4"
                  >
                    {copied
                      ? "Copied Thing Model"
                      : "Click to copy the full Thing Model"}
                  </BaseButton>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
export default FormMetadata;
