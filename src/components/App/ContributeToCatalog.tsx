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
import FormMetadata from "../App/FormMetadata";
import FormInteraction from "../App/FormInteraction";
import FormSubmission from "../App/FormSubmission";
import type { FormElementBase } from "wot-thing-description-types";

interface ContributeToCatalogProps {
  currentStep: number;

  // Step 1 - Metadata
  metadata: {
    model: string;
    author: string;
    manufacturer: string;
    license: string;
    copyrightYear: string;
    holder: string;
    validation: Validation;
    errorMessage: string;
    copied: boolean;
  };
  onChangeModel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeAuthor: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeManufacturer: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeLicense: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeCopyrightYear: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeHolder: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClickCatalogValidation: () => void;
  onClickCopyThingModel: () => void;

  // Step 2 - Interaction
  filteredHeaders: { key: string; text: string }[];
  filteredRows: (FormElementBase & {
    id: string;
    description: string;
    propName: string;
    title: string;
  })[];
  backgroundTdToSend: ThingDescription;
  interaction: ContributionToCatalogState["interaction"];
  dispatch: React.Dispatch<any>;
  handleFieldChange: (placeholder: string, value: string) => void;

  // Step 3 - Submission
  submission: {
    tmCatalogEndpoint: string;
    tmCatalogEndpointError: string;
    repository: string;
    repositoryError: string;
    submittedError: string;
    submitted: boolean;
    id: string;
    link: string;
  };
  handleTmCatalogEndpointChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleRepositoryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => Promise<void>;
}

const ContributeToCatalog: React.FC<ContributeToCatalogProps> = ({
  currentStep,
  metadata,
  onChangeModel,
  onChangeAuthor,
  onChangeManufacturer,
  onChangeLicense,
  onChangeCopyrightYear,
  onChangeHolder,
  onClickCatalogValidation,
  onClickCopyThingModel,
  filteredHeaders,
  filteredRows,
  backgroundTdToSend,
  interaction,
  dispatch,
  handleFieldChange,
  submission,
  handleTmCatalogEndpointChange,
  handleRepositoryChange,
  handleSubmit,
}) => {
  return (
    <div className="my-4 flex space-x-2">
      {currentStep === 1 && (
        <FormMetadata
          model={metadata.model}
          onChangeModel={onChangeModel}
          author={metadata.author}
          onChangeAuthor={onChangeAuthor}
          manufacturer={metadata.manufacturer}
          onChangeManufacturer={onChangeManufacturer}
          license={metadata.license}
          onChangeLicense={onChangeLicense}
          copyrightYear={metadata.copyrightYear}
          onChangeCopyrightYear={onChangeCopyrightYear}
          holder={metadata.holder}
          onChangeHolder={onChangeHolder}
          onClickCatalogValidation={onClickCatalogValidation}
          onClickCopyThingModel={onClickCopyThingModel}
          isValidating={metadata.validation === "VALIDATING"}
          isValid={metadata.validation === "VALID"}
          errorMessage={metadata.errorMessage}
          copied={metadata.copied}
        />
      )}

      {currentStep === 2 && (
        <FormInteraction
          filteredHeaders={filteredHeaders}
          filteredRows={filteredRows}
          backgroundTdToSend={backgroundTdToSend}
          interaction={interaction}
          dispatch={dispatch}
          handleFieldChange={handleFieldChange}
        />
      )}

      {currentStep === 3 && (
        <FormSubmission
          tmCatalogEndpoint={submission.tmCatalogEndpoint}
          tmCatalogEndpointError={submission.tmCatalogEndpointError}
          handleTmCatalogEndpointChange={handleTmCatalogEndpointChange}
          repository={submission.repository}
          repositoryError={submission.repositoryError}
          handleRepositoryChange={handleRepositoryChange}
          handleSubmit={handleSubmit}
          submittedError={submission.submittedError}
          submitted={submission.submitted}
          id={submission.id}
          link={submission.link}
        />
      )}
    </div>
  );
};

export default ContributeToCatalog;
