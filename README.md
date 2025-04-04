![alt text](https://github.com/eclipse/editdor/blob/master/logo/1585_ediTDor_logo.png "ediTDor logo")

[![Discord](https://img.shields.io/badge/Discord-7289DA?logo=discord&logoColor=white&label=WoT CG Discord)](https://discord.gg/RJNYJsEgnb)

A tool for simply designing W3C Thing Descriptions and Thing Models

Find the ediTDor here to try it out: 

https://eclipse.github.io/editdor/

## Building the App
There are two ways this app can be built. One way would be for using it as a standalone application, the 
other one for using it embedded into a production environment.
The available environment variables are:
``` bash
REACT_APP_IS_STANDALONE={flag} # true or false
REACT_APP_HOST={hostname} # default: localhost
REACT_APP_PORT={port} # default: 8080
```

If the REACT_APP_IS_STANDALONE environment variable is set to true, REACT_APP_HOST and REACT_APP_PORT are going to be
used for building the UIs target. Otherwise "/" is used.
The package.json already contains build options for this (build, build-standalone).

## About this project

The goal of this project is the easy creation of W3C Thing Description instances and Thing Models by providing a platform-independent ediTDor tool. The following features are addressed in this project

- Creating a new Thing Description / ThingModel from scratch
- Rendering a Thing Description / Thing Model
- Editing the Thing Description / Thing Model
- Validating the Thing Description / ThingModel
- Exporting the Thing Description / ThingModel from the visual representation into JSON-LD
- Reading/writing/observing exposed properties' values exposed by a proxy (anything that can translate a protocol to HTTP)


## Technologies
- React
- TailwindCSS

## Contribution guide

Any contribution to this project is welcome. 
Please follow our [contribution guide](./CONTRIBUTING.md).

## License
* [Eclipse Public License v. 2.0](http://www.eclipse.org/legal/epl-2.0)
  
## Prerequisites
* [NodeJS](https://nodejs.org/), version 10+ (e.g., 10.13.0 LTS)

## Start Locally
`yarn dev` starts a local development server on Port 3000 (http://localhost:3000)

## Build
`yarn install` install all the dependencies listed within package.json

`yarn build` builds the project for deployment

## Implemented Features: 
* JSON Editor with JSON Schema support for TD (Autocompletion, JSON Schema Validation)
* Add Property, Action, Event by wizard
* Render TD to be more human readable
* Validate JSON Syntax and JSON Schema for TD (JSONLD and Additional Validation for nested TM will be implemented in the future)

