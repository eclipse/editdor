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
import { AlertTriangle, Check, Copy, ExternalLink } from "react-feather";

interface IFormCatalogTMEndpoints {
  tmCatalogEndpoint: string;
  tmCatalogEndpointError: string;
  handleTmCatalogEndpointChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  repository: string;
  repositoryError: string;
  handleRepositoryChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  submittedError: string;
  submitted: boolean;
  id: string;
  link: string;
}

const FormCatalogTmEndpoints: React.FC<IFormCatalogTMEndpoints> = ({
  tmCatalogEndpoint,
  tmCatalogEndpointError,
  handleTmCatalogEndpointChange,
  repository,
  repositoryError,
  handleRepositoryChange,
  handleSubmit,
  submittedError,
  submitted,
  id,
  link,
}) => {
  const handleOpenLinkClick = async () => {
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleCopyIdClick = async () => {
    await navigator.clipboard.writeText(id);
  };

  return (
    <>
      <div className="w-full rounded-md bg-black bg-opacity-80 p-2">
        <h1 className="font-bold">
          Add the TM Catalog Endpoint and Repository URL
        </h1>
        <div className="w-[70%] px-4">
          <DialogTextField
            label="TM Catalog Endpoint"
            placeholder="TM Catalog Endpoint:..."
            id="catalogEndpoint"
            type="text"
            value={tmCatalogEndpoint}
            autoFocus={false}
            onChange={handleTmCatalogEndpointChange}
            className={`${
              tmCatalogEndpointError ? "border-red-500" : "border-gray-300"
            } w-full rounded-md border p-2 text-sm`}
          />
          {tmCatalogEndpointError && (
            <div className="mt-1 text-sm text-red-500">
              {tmCatalogEndpointError}
            </div>
          )}
          <DialogTextField
            label="Name of the Repository"
            placeholder="In case there are multiple repositories hosted, specify which one with a string. Example: my-catalog"
            id="urlRepository"
            type="text"
            value={repository}
            autoFocus={false}
            onChange={handleRepositoryChange}
            className={`${
              repositoryError ? "border-red-500" : "border-gray-300"
            } w-full rounded-md border p-2 text-sm`}
          />
          {repositoryError && (
            <div className="mt-1 text-sm text-red-500">{repositoryError}</div>
          )}
          <div className="flex flex-row justify-end">
            <BaseButton
              id="submit"
              onClick={handleSubmit}
              variant="primary"
              type="button"
              className="mb-2 mt-6 w-1/4"
            >
              Submit
            </BaseButton>
          </div>
        </div>

        <div className="flex flex-col justify-center py-2">
          {submittedError && (
            <div className="mb-2 mt-2 inline h-full w-full rounded bg-red-500 p-1 text-white">
              <AlertTriangle size={16} className="mr-1 inline" />
              {submittedError}
            </div>
          )}
          {submitted && (
            <>
              <div className="mb-2 mt-2 inline h-10 rounded bg-green-500 p-2 text-white">
                <Check size={16} className="mr-1 inline" />
                {"TM submitted successfully!"}
              </div>
              <div className="mb-2 mt-2 grid grid-cols-3 items-center">
                <div className="col-span-1 w-full">
                  <BaseButton
                    id={id}
                    onClick={handleCopyIdClick}
                    variant="primary"
                    type="button"
                    className="w-3/4"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span>Copy TM id</span>
                      <Copy size={20} className="ml-2 cursor-pointer" />
                    </div>
                  </BaseButton>
                </div>
                <h1 className="col-span-2 pl-4 text-center">{id}</h1>
              </div>
              <div className="mb-2 mt-2 grid grid-cols-3 items-center">
                <div className="col-span-1">
                  <BaseButton
                    id={link}
                    onClick={handleOpenLinkClick}
                    variant="primary"
                    type="button"
                    className="w-3/4"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span>Open in new tab</span>
                      <ExternalLink
                        size={20}
                        className="ml-2 inline cursor-pointer"
                      />
                    </div>
                  </BaseButton>
                </div>
                <h1 className="col-span-2 pl-4 text-center">{link}</h1>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default FormCatalogTmEndpoints;
