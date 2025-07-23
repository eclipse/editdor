![alt text](https://github.com/eclipse/editdor/blob/master/logo/1585_ediTDor_logo.png "ediTDor logo")
[![Discord](https://img.shields.io/badge/Discord-7289DA?logo=discord&logoColor=white&label=WoT-CG-Discord)](https://discord.com/channels/1081253871688622181/1359286591100817549)

A tool for simply designing W3C Thing Descriptions and Thing Models

Find the ediTDor here to try it out:

https://eclipse.github.io/editdor/

## About this project

This project aims to make creating W3C Thing Description instances and Thing Models easy by providing a platform-independent ediTDor tool. The following features are addressed in this project

- Creating a new Thing Description / ThingModel from scratch
- Rendering a Thing Description / Thing Model
- Editing the Thing Description / Thing Model
- Validating the Thing Description / ThingModel
- Exporting the Thing Description / ThingModel from the visual representation into JSON-LD
- Reading/writing exposed properties' values exposed by a proxy (anything that can translate a protocol to HTTP)

## Technologies

- React
- TailwindCSS
- Typescript

## Contribution guide

Any contribution to this project is welcome.
Please follow our [contribution guide](./CONTRIBUTING.md).

## License

- [Eclipse Public License v. 2.0](http://www.eclipse.org/legal/epl-2.0)

## Prerequisites

- [Node.js](https://nodejs.org/), version 10+ (e.g., 10.13.0 LTS)

## Build

`yarn install` installs all the dependencies listed within package.json

`yarn build` builds the project for deployment

`yarn dev` starts a local development server on Port 3000 (http://localhost:3000)

## Development enviroment

In development environment it is possible to use [react scan](https://react-scan.com/) to detect performance issues by analyzing the pop up on the bottom right corner. The complete documentation is available [here](https://github.com/aidenybai/react-scan#readme).

## Implemented Features:

- JSON Editor with JSON Schema support for TD (Autocompletion, JSON Schema Validation)
- Add Property, Action, Event by wizard
- Render TD to be more human-readable
- Validate JSON Syntax and JSON Schema for TD (JSONLD and Additional Validation for nested TM will be implemented in the future)
- Add a TM or TD via a CSV file (For now, Modbus only)
