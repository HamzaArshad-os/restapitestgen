This is a tool that can be used by other devleopers to generate response and respnse structure valaidationtests for RESTAPIS given an openapi specificication(a3.0.0) in YAML format. 

Simply install node modules and this pacakge using npm install restapitestgen
and import into your project.

import * as testgen from "restapitestgen";

testgen.main("Project/specificationExamples/tradingviewSpecResolvedOnly.yaml");



Give the main the path to an OpenAPI specification. and simply hit run, Will generate rest api tests for all endpoints and methods. And use the information in the responses to validate resposne codes and response structure. 
Has support for YAML resolved and Unresolved. Will generate tests in JavaScript and also using JSON-SCHEMA-FAKER to generate both good mock data and bad mock data
(current version will generate bad mock data that has different datatypes eg: schema defined property to be integer, the schema is modifed to set the property to string). Future versions of this tool will allow users to fully customise how they want to generate the bad mock data.
All generated content is inserted into a easy to understand Generated Content directory. Which can be found in node_modules>restapitestgen>GeneratedContent.. the location of this content that is generated will be moved in a future version.


