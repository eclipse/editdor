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
- Contributing the Thing Model to a third-party catalogue using [the Thing Model Catalog API](https://github.com/wot-oss/tmc).

## Technologies

- React
- TailwindCSS
- Typescript

## Resources

- [Introduction Web of Things concept - Wikipedia](https://en.wikipedia.org/wiki/Web_of_Things)
- [Introduction Thing Description - Wikipedia](https://en.wikipedia.org/wiki/Thing_Description)
- [Standard - W3C Web of Things - Thing Description](https://www.w3.org/TR/2023/REC-wot-thing-description11-20231205/)
- [Standard - W3C Web of Things (WoT) Modbus Binding](https://w3c.github.io/wot-binding-templates/bindings/protocols/modbus)
- [Web of Things Homepage](https://www.w3.org/WoT/)

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

### Using the Catalog Contribution Feature

You will need a [Thing Model Catalog](https://github.com/wot-oss/tmc) running somewhere. If you want to host it yourself, use the command-line interface to run one in the terminal using the following instructions:

    go install github.com/wot-oss/tmc@v0.1.2
    $GOPATH/bin/tmc
    ./tmc-linux-amd64

The most use commands to test are:

    tmc serve
    tmc repo add --type file <nameOfCatalog> ~/tm-catalog

You will have a local folder inside tm-catalog folder

    tmc list
    tmc repo list
    tmc repo remove <nameOfCatalog>

### Send TD feature

To use the **_Send TD_** feature, it is necessary to define on Settings pop up the Southbound URL and Northbound URL. The Send TD feature allows you to send your Thing Description to any service following [the WoT TD Directory specification](https://www.w3.org/TR/wot-discovery/#exploration-directory-api-things).
Afterwards, if the service proxies the TD, EdiTDor can fetch the proxied TD containing HTTP `href`s to interact with the original Thing.

#### Configuration

1. Open the Settings dialog from the main toolbar
2. Enter your Southbound URL in the designated field (e.g., `http://localhost:8080`)
3. Click Save to store the URL

The proxy uses the TD sent to its southbound API endpoint to communicate with a Thing. This way, you can interact with a non-HTTP Thing from your EdiTDor.

## Implemented Features:

- JSON Editor with JSON Schema support for TD (Autocompletion, JSON Schema Validation)
- Add Property, Action, Event by wizard
- Render TD to be more human-readable
- Validate JSON Syntax and JSON Schema for TD (JSONLD and Additional Validation for nested TM will be implemented in the future)
- Add a TM or TD via a CSV file (For now, Modbus only)
- Configuration on Settings page includes: southbound URL, northbound URL, save location, and configuration of the path value
