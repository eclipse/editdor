![alt text](https://github.com/eclipse/editdor/blob/master/logo/1585_ediTDor_logo.png "ediTDor logo")

A tool for simply designing W3C Thing Descriptions and Thing Models

Find the ediTDor here to try it out: 

https://eclipse.github.io/editdor/


## About this project

The goal of this project is the easy creation of W3C Thing Description instances and Thing Models by providing a platform independent ediTDor tool. The following features will be addressed in this project

- Creating a new Thing Description / ThingModel from scratch
- Rendering a Thing Description / Thing Model
- Editing the Thing Description / Thing Model
- Validating the Thing Description / ThingModel
- Exporting the Thing Description / ThingModel from the visual representation into JSON-LD

## Technologies
- React
- TailwindCSS

## Contribution guide
Any contribution to this project is welcome. If you want to report a bug or have a question, please check the [issue list](https://github.com/Web-of-Things/ediTDor/issues) or create a new issue. If you want to contribute to this project by coding, please follow the general contribution guidelines as described [here](https://github.com/firstcontributions/first-contributions/blob/master/README.md). Many thanks. 

## License
* [Eclipse Public License v. 2.0](http://www.eclipse.org/legal/epl-2.0)
  
## Prerequisites
### To use with Node.js
All systems require:
* [NodeJS](https://nodejs.org/) version 10+ (e.g., 10.13.0 LTS)

## Start Locally
`yarn start` starts a local development server on Port 3000 (http://localhost:3000)

## Build
`yarn build` builds the project for deployment

## Implemented Features: 
* JSON Editor with JSON Schema support for TD (Autocompletion, JSON Schema Validation)
* Add Property, Action, Event by wizard
* Render TD to be more human readable
