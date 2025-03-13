![alt text](https://github.com/eclipse/editdor/blob/master/logo/1585_ediTDor_logo.png "ediTDor logo")
[![Discord](https://img.shields.io/badge/Discord-7289DA?logo=discord&logoColor=white&label=ediTDor)](https://discord.gg/57NsMQxAcu)

A tool for simply designing W3C Thing Descriptions and Thing Models

Find the ediTDor here to try it out:

https://eclipse.github.io/editdor/

## Using the AI Chat Function

The AI chat is currently implemented using Azures cognitive services API. To make use of the chat
the app has to be compiled with two additional environment variables:

```bash
REACT_APP_OPENAI_KEY={api_key}
REACT_APP_OPENAI_URI={azure_resource_address}
```

## About this project

The goal of this project is the easy creation of W3C Thing Description instances and Thing Models by providing a platform-independent ediTDor tool. The following features are addressed in this project

- Creating a new Thing Description / ThingModel from scratch
- Rendering a Thing Description / Thing Model
- Editing the Thing Description / Thing Model
- Validating the Thing Description / ThingModel
- Exporting the Thing Description / ThingModel from the visual representation into JSON-LD

## Technologies

- React
- TailwindCSS

## Contribution guide

Any contribution to this project is welcome. If you want to report a bug or question, please check the [issue list](https://github.com/eclipse/editdor/issues) or create a new issue.

If you want to contribute to this project by coding, please follow the general contribution guidelines described [here](https://github.com/firstcontributions/first-contributions/blob/master/README.md). Code submisons required

1. an Eclipse account to make Pull Requests.
2. Signed commits, on your github account make sure you kave a ssh key or a gpg key of the type **singin** on the Settings Page.

In your local repository you can check your signatures by using

    git log --show-signature

Use the -s flag
git commit -s -m "commit message"

More documentation about this topic [here](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification)

## License

- [Eclipse Public License v. 2.0](http://www.eclipse.org/legal/epl-2.0)

## Prerequisites

### To use with Node.js

All systems require the following:

- [NodeJS](https://nodejs.org/) version 10+ (e.g., 10.13.0 LTS)

## Install dependencies

`npm install` install all the dependencies listed within package.json

## Start Locally

`npm run start` starts a local development server on Port 3000 (http://localhost:3000)

## Build

`npm install` install all the dependencies listed within package.json

`npm build` builds the project for deployment

## Implemented Features in the ediTDor:

- JSON editor with JSON Schema support for TD (autocompletion)
- Add Property, Action, Event by wizard
- Render TD to be more human readable
- Validate JSON Syntax and JSON Schema for TD (JSONLD and Additional Validation for nested TMs will be implemented in the future)
