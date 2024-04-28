



import * as statushttp from "statushttp";

import * as datageneration from "./mockDataGeneration.js";
import * as yamlInteract from "./yamlInteract.js";
import * as fileHandler from "./fileHandling.js";
import * as main from "./main.js";





let variablesForAllTests = {};

// Define a boolean variable to control whether the loops should break
let shouldBreak = false; // Set to false when validated it works properly

// Define a counter variable
let counter = 0;
let upToCounter = 10;
let definedVariablesAtTopOfFile = [];

//entry point
export const testgenerationEntryPoint = (data) => {
  let endpointList = {};
  for (let endpoint in data.paths) {
    let newTestFileContent = "";
    let externalFilesUsedInThisFilesTests = [];
    endpointList[endpoint] = {};
    let topOfTestFile = javascriptTestTopOfFile(data);
    //newTestFileContent += topOfTestFile;
    for (let method in data.paths[endpoint]) {
      endpointList[endpoint][method] = {};
      for (let response in data.paths[endpoint][method].responses) {
        // Retrieve the information for this endpoint, method, and response from the maps
        let relevantSchemasAndMockData = getInfo(yamlInteract.uniqueSchemaGenMockData, endpoint, method, response);
        //console.log(JSON.stringify(relevantSchemasAndMockData, null, 2));
        // Retrieve the information for this endpoint, method, and response from the maps
        let allRelevantHeaders = getInfo(yamlInteract.uniqueHeadersMap, endpoint, method, response);

        let endpointForThisTestInsertedIntoTest = endpoint;
        let queryForThisTestInsertedIntoTest = [];
        let securityForThisTestInsertedIntoTest = [];
        let methodForThisTestInsertedIntoTest = method;
        // let externalFilesUsedInThisFilesTests = []; defined above so no need to define again here, besides this is at  top of file

        //console.log(responseCodeForThisTestInsertedIntoTest);
        let responseStructure = "";

        // Paramter handling
        let parametersData = relevantSchemasAndMockData.filter((item) => item.usage.some((usage) => usage.location === "parameters"));
        //Generation of variables for parameters to be put in fileif(parametersData.length > 0){
        let names = parametersData.map((parameterData) => extractInfo(parameterData, "name"));
        // First loop to generate all variables
        for (let parameterData of parametersData) {
          //console.log("-------------------");
          //console.log(parameterData);
          let name = extractInfo(parameterData, "name");
          
          let goodMockData = extractInfo(parameterData, "goodMockData");
         // console.log(goodMockData);
          //console.log(goodMockData[0])
          let generatedVariable = jsGenerateParamterVariable(name, goodMockData[0]);
          if (generatedVariable) {
            if (generatedVariable) {
              topOfTestFile += generatedVariable;
            }
             //console.log(generatedVariable);
          }
        }
        // handle the endpoint path
        endpointForThisTestInsertedIntoTest = endpoint;
        for (let parameterData of parametersData) {
          let name = extractInfo(parameterData, "name");
          let modifiedEndpoint = "";

          // Iterate over the usage array
          for (let usage of parameterData.usage) {
            let path = extractInfo(usage, "path");
            //console.log(endpoint, method, response);

            let pathOrQuery = extractInfo(usage, "inPathOrQuery");
            if (path === endpoint) {
              if (pathOrQuery === "path") {
                let modifiedPath = replacePathParametersWithVariables(path, names);
                //console.log(path, modifiedPath);
                modifiedEndpoint = modifiedPath;
                // Assign modifiedEndpoint to endpointForThisTestInsertedIntoTest
                endpointForThisTestInsertedIntoTest = modifiedEndpoint;
              }
              if (pathOrQuery === "query") {
                let queryEntry = generateQueryString(name);
                //console.log(queryEntry);
                // Add queryEntry to queryForThisTestInsertedIntoTest
                queryForThisTestInsertedIntoTest.push(queryEntry);
              }
            }
          }
        }

        //hEADER
        // Separate request and response headers
        let requestHeaders = allRelevantHeaders.filter((header) => header.usage.some((usage) => usage.foundAt === "header"));
        let responseHeaders = allRelevantHeaders.filter((header) => header.usage.some((usage) => usage.foundAt.startsWith("response")));

        let requestHeaderCodeInsertIntoTest = [];
        requestHeaders.forEach((singleRequestHeader) => {
          let headerName = singleRequestHeader.name;
          let headerValue = "your-secuirty or header Info here";
          let requestHeadertestCode = generateRequestHeaderTestCode(singleRequestHeader);
          let requestHeadervariableCode = jsGenerateHeaderVariable(headerName, headerValue);

          if (requestHeadervariableCode) {
            newTestFileContent += requestHeadervariableCode;
          }
          //console.log(requestHeadervariableCode);
          //console.log(requestHeadertestCode);
          requestHeaderCodeInsertIntoTest.push(requestHeadertestCode);
        });

        let responseHeaderCodeInsertIntoTest = [];
        responseHeaders.forEach((singleResponseHeader) => {
          let headerName = singleResponseHeader.name;
          let headerValue = "expected-header-value"; // Replace this with the expected value or a variable holding the value
          let responseHeadertestCode = generateResponseHeaderTestCode(singleResponseHeader);
          let resposneHeadervariableCode = jsGenerateHeaderVariable(headerName, headerValue);

          if (resposneHeadervariableCode) {
            newTestFileContent += resposneHeadervariableCode;
          }
          responseHeaderCodeInsertIntoTest.push(responseHeadertestCode);
        });

        //console.log(requestHeader);
        //console.log(responseHeader);

        // Handling of  requestBody
        let sendString = "";
        let requestBodyData = relevantSchemasAndMockData.filter((item) => item.usage.some((usage) => usage.location === "requestBody"));
        // console.log(JSON.stringify(requestBodyData, null, 2));
        //If the method is Patch, Post or Put then we need to generate variables that define the filepaths for the good and bad mockData
        if ((method === "post" || method === "put" || method === "patch") && requestBodyData.length > 0) {
          let goodMockDataFilePath = extractInfo(requestBodyData[0], "goodMockDataFilePath");
          let badMockDataFilePaths = extractFilePaths(requestBodyData[0], "badMockDataFilePath_");
          //console.log(badFilePaths);

          let [goodMockDataVariableName, generatedGoodFilePathVariables] = jsGenerateMockDataPathVariable("goodMockData", goodMockDataFilePath);

          // console.log(generatedGoodFilePathVariables);
          if (generatedGoodFilePathVariables) {
            topOfTestFile += generatedGoodFilePathVariables;
            externalFilesUsedInThisFilesTests.push(goodMockDataVariableName);
          }

          for (let badFilePath of badMockDataFilePaths) {
            // Get the filename from the path
            let fileName = getFileNameFromPath(badFilePath);
            // Use the filename as the variable name
            //let generatedBadFilePathVariables = jsGenerateMockDataPathVariable(fileName, badMockDataFilePaths); old
            let [badMockDataVariableName, generatedBadFilePathVariables] = jsGenerateMockDataPathVariable(fileName, badFilePath); //new
            //console.log(generatedBadFilePathVariables);
            if (generatedBadFilePathVariables) {
              //console.log(generatedBadFilePathVariables);

              if (generatedBadFilePathVariables) {
                topOfTestFile += generatedBadFilePathVariables; //ssss
                externalFilesUsedInThisFilesTests.push(badMockDataVariableName.toUpperCase());
              }
            }
          }
          //retriving the mockData structure for .send fucntioanlity
          let goodmockData = requestBodyData[0].goodMockData[0];
          // console.log(JSON.stringify(goodmockData, null, 2));
          // Get the keys
          let keysForBody = Object.keys(goodmockData || {});
          sendString = generateSendString(keysForBody, "item");
          //console.log(sendString);
        }

        //Handling of Response Schemas to be used in resposne Section
        let resposneCode = response;
        let responseSchemaData = relevantSchemasAndMockData.filter((item) => item.usage.some((usage) => usage.location === "response"));
        if (responseSchemaData.length > 0) {
          let goodResponseSchema = extractInfo(responseSchemaData[0], "goodSchema");
          //console.log(JSON.stringify(goodResponseSchema, null, 2));
          let expectStatements = jsGenerateResponseExpectStatements(goodResponseSchema);
          //console.log("expectStatemnts:" + expectStatements);
          responseStructure += expectStatements;
        }

        // console.log(endpointForThisTestInsertedIntoTest);
        //console.log(responseHeaderCodeInsertIntoTest)

        if (method === "get" || method === "delete") {
          let singleTest = jsGetDeleteTemplate(
            data,
            endpointForThisTestInsertedIntoTest,
            methodForThisTestInsertedIntoTest,
            requestHeaderCodeInsertIntoTest,
            response,
            responseStructure,
            responseHeaderCodeInsertIntoTest
          );

          if (singleTest) {
            newTestFileContent += singleTest;
          }
        } else {
          //console.log(externalFilesUsedInThisFilesTests.length);
          externalFilesUsedInThisFilesTests.forEach((filePathBeingInteractedWithForThisTest) => {
            //console.log(filePathBeingInteractedWithForThisTest);
            let test = jsPostPutPatchTemplate(
              data,
              endpointForThisTestInsertedIntoTest,
              methodForThisTestInsertedIntoTest,
              requestHeaderCodeInsertIntoTest,
              response,
              responseStructure,
              responseHeaderCodeInsertIntoTest,
              filePathBeingInteractedWithForThisTest,
              sendString
            );
            //console.log(test);
            if (test) {
              newTestFileContent += test;
            }
          });
        }

        // Increment the counter
        counter++;

        // Break the loop if the counter reaches upToCounter or shouldBreak is true
        if (counter >= upToCounter && shouldBreak) {
          break;
        }
      }
      if (counter >= upToCounter && shouldBreak) {
        break;
      }
    }

    if (counter >= upToCounter && shouldBreak) {
      break;
    }
    let finalTestFIle = topOfTestFile + newTestFileContent;
    //console.log(newTestFileContent);
    fileHandler.generateJavaScriptFileInsertContent(`Tests for: ${endpoint}`, finalTestFIle);
    definedVariablesAtTopOfFile = []; //empty this array so that the next test file can have its own variables
    externalFilesUsedInThisFilesTests = []; //empty this array so that the next test file can have its own extenral ifles defined for it.
  }
};

export const handleOtherInfoGivenBySpec = (data, endpoint, method, response) => {
  let tags = getMethodInformation(data, endpoint, method, "tags") || "no tags";
  let summary = getMethodInformation(data, endpoint, method, "summary") || "no summary";
  let description = getMethodInformation(data, endpoint, method, "description") || "no description";
  let operationId = getMethodInformation(data, endpoint, method, "operationId") || "no operationId";
  let requestBody = getMethodInformation(data, endpoint, method, "requestBody") || "no requestBody";
  let responses = getMethodInformation(data, endpoint, method, "responses") || "no responses";
  let callbacks = getMethodInformation(data, endpoint, method, "callbacks") || "no callbacks";
  let deprecated = getMethodInformation(data, endpoint, method, "deprecated") || "no deprecated";
  let security = getMethodInformation(data, endpoint, method, "security") || "no security";
  let responseStatusDescription = getStatusDescription(response) || "no responseStatusDescription";

  return [tags, summary, description, operationId, requestBody, responses, callbacks, deprecated, security, responseStatusDescription];
};

function generateSendString(keys, param) {
  // If keys is not provided or is an empty array, return an empty string
  if (!keys || keys.length === 0) {
    return "";
  }
  let result = ".send({\n";
  for (let key of keys) {
    result += `  ${key}: ${param}.${key},\n`;
  }
  result += "})";
  return result;
}

export const getStatusDescription = (statusCode) => {
  return statushttp.statusDesc[statusCode];
};

export const getMethodInformation = (data, endpoint, method, info) => {
  if (data[yamlInteract.endpoint_path][endpoint] && data[yamlInteract.endpoint_path][endpoint][method] && data[yamlInteract.endpoint_path][endpoint][method].hasOwnProperty(info)) {
    return data[yamlInteract.endpoint_path][endpoint][method][info];
  } else {
    //console.error(`Endpoint ${endpoint}, method ${method}, or information ${info} not found in the provided data.`);
    return null;
  }
};

export const jsGetDeleteTemplate = (data, endpoint, method, allRelevantHeaders, response, responseStructure, responseHeaders) => {
  let [tags, summary, description, operationId, requestBody, responses, callbacks, deprecated, thiSecurity, responseStatusDescription] = handleOtherInfoGivenBySpec(data, endpoint, method, response);

  let url = yamlInteract.getServerInfo(data)[0].url;
  //console.log(url);
  //console.log(allRelevantHeaders);
  //console.log(responseHeaders);
  let requestHeadersInsertedIntoTest = "";
  if (allRelevantHeaders.length > 0) {
    requestHeadersInsertedIntoTest = allRelevantHeaders.join("\n");
  } else {
    requestHeadersInsertedIntoTest = ".set()\n";
  }
  let responseHeadersInsertedIntoTest = "";
  if (responseHeaders.length > 0) {
    responseHeadersInsertedIntoTest = responseHeaders.join("\n");
  } else {
    responseHeadersInsertedIntoTest = "";
  }
  description = description.replace(/\n/g, " ");

  let javascriptTest = "";
  javascriptTest += `\ndescribe('${description}', () => {\n`;
  javascriptTest += `  it('should return status ${response}', () => {\n`;
  javascriptTest += `    return chai\n`;
  javascriptTest += `      .request('${url}')\n`;
  javascriptTest += `      .${method}(${endpoint})\n`;
  javascriptTest += `      ${requestHeadersInsertedIntoTest}\n`;
  javascriptTest += `      .then((res) => {\n`;
  javascriptTest += `        expect(res).to.have.status(${response});\n`;
  javascriptTest += `        ${responseHeadersInsertedIntoTest}\n`;
  javascriptTest += `        ${responseStructure}\n`;
  javascriptTest += `      })\n`;
  javascriptTest += `      .catch((err) => {\n`;
  javascriptTest += `        throw err;\n`;
  javascriptTest += `      });\n`;
  javascriptTest += `  });\n`;
  javascriptTest += `});\n`;

  return javascriptTest;
};
export const jsPostPutPatchTemplate = (data, endpoint, method, allRelevantHeaders, response, responseStructure, responseHeaders, mockDataFilePath, setTestCode) => {
  let [tags, summary, description, operationId, requestBody, responses, callbacks, deprecated, thiSecurity, responseStatusDescription] = handleOtherInfoGivenBySpec(data, endpoint, method, response);

  // Remove newline characters from the description
  description = description.replace(/\n/g, " ");

  let url = yamlInteract.getServerInfo(data)[0].url;

  let requestHeadersInsertedIntoTest = "";
  if (allRelevantHeaders.length > 0) {
    requestHeadersInsertedIntoTest = allRelevantHeaders.join("\n");
  } else {
    requestHeadersInsertedIntoTest = ".set()\n";
  }
  let responseHeadersInsertedIntoTest = "";
  if (responseHeaders.length > 0) {
    responseHeadersInsertedIntoTest = responseHeaders.join("\n");
  } else {
    responseHeadersInsertedIntoTest = "";
  }

  let javascriptTest = "";
  javascriptTest += `\ndescribe('${description}', () => {\n`;
  javascriptTest += `  before(() => {\n`;
  javascriptTest += `    console.log("[Script: " + ${mockDataFilePath} + "]");\n`;
  javascriptTest += `  });\n`;
  javascriptTest += `  ${mockDataFilePath}.forEach((item) => {\n`; // Added opening bracket
  javascriptTest += `    it('Should return status ${response}: ', () => {\n`;
  javascriptTest += `      return chai\n`;
  javascriptTest += `        .request('${url}')\n`;
  javascriptTest += `        .${method}(${endpoint})\n`;
  javascriptTest += `        ${requestHeadersInsertedIntoTest}\n`;
  javascriptTest += `        .send(item)\n`;
  javascriptTest += `        ${setTestCode}\n`;
  javascriptTest += `        .then((res) => {\n`;
  javascriptTest += `          expect(res).to.have.status(${response});\n`;
  javascriptTest += `          ${responseHeadersInsertedIntoTest}\n`;
  javascriptTest += `          ${responseStructure}\n`;
  javascriptTest += `        })\n`;
  javascriptTest += `        .catch((err) => {\n`;
  javascriptTest += `          throw err;\n`;
  javascriptTest += `        });\n`;
  javascriptTest += `    });\n`;
  javascriptTest += `  });\n`;
  javascriptTest += `});\n`;

  return javascriptTest;
};

function getFileNameFromPath(path) {
  // Split the path into parts
  let parts = path.split("\\");
  // Get the last part (the filename)
  let filename = parts[parts.length - 1];
  // Remove the extension
  let name = filename.split(".")[0];
  return name;
}

function getInfo(map, endpoint, method, response) {
  let matchingItems = [];
  // Iterate over the map
  for (let [key, item] of map.entries()) {
    // Check if the usage section contains the specific endpoint, method, and response
    if (item.usage.some((usage) => usage.path === endpoint && usage.method === method && usage.response === response)) {
      // If it does, add the item to the array of matching items
      matchingItems.push(item);
    }
  }
  // Return the array of matching items
  return matchingItems;
}

function extractFilePaths(obj, prefix) {
  // Initialize an array to hold the values
  let values = [];
  // Iterate over the keys in the object
  for (let key in obj) {
    // If the key starts with the specified string, add the value to the array
    if (key.startsWith(prefix)) {
      values.push(obj[key]);
    }
  }
  // Return the array of values
  return values;
}

function extractInfo(obj, keyPath) {
  // Split the keyPath into an array of keys
  let keys = keyPath.split(".");

  // Start with the entire object
  let value = obj;

  // Iterate over the keys
  for (let key of keys) {
    // If the key exists in the current value, update the value
    if (key in value) {
      value = value[key];
    } else {
      // If the key doesn't exist, return null
      return null;
    }
  }

  // Return the final value
  return value;
}

export const jsGenerateParamterVariable = (name, mockData) => {
  let finishedVariable = "";
  let variableName = name.toUpperCase();
  // Check if mockData is a string and add quotation marks around it if it is
  let variableValue = typeof mockData === "string" ? `"${mockData}"` : mockData;

  finishedVariable += `let ${variableName} = ${variableValue};\n`;

  // Check if the finishedVariable already exists in the array
  if (!definedVariablesAtTopOfFile.includes(finishedVariable)) {
    // If it doesn't exist, add it to the array
    definedVariablesAtTopOfFile.push(finishedVariable);
    return finishedVariable;
  } else {
    // If it does exist, return null
    return null;
  }
};


export const jsGenerateMockDataPathVariable = (name, mockDatapath) => {
  // Ensure mockDatapath is a string
  if (typeof mockDatapath !== "string") {
    console.error("mockDatapath is not a string:", mockDatapath);
    return [null, null];
  }

  // Remove any special characters and convert spaces to underscores
  let safeName = name.replace(/[^a-zA-Z0-9_$]/g, "_");
  let mockDataVariableName = safeName.toUpperCase();
  let mockDataPath = mockDatapath.replace(/\\/g, "/");

  let finishedVariable = `const ${mockDataVariableName} = require("${mockDataPath}");\n`;

  // Check if the finishedVariable already exists in the array
  if (!definedVariablesAtTopOfFile.includes(finishedVariable)) {
    // If it doesn't exist, add it to the array
    definedVariablesAtTopOfFile.push(finishedVariable);
    // Return both the variable name and the finished variable
    return [mockDataVariableName, finishedVariable];
  } else {
    // If it does exist, return null for both
    return [null, null];
  }
};

function jsGenerateResponseExpectStatements(schema, path = "res.body") {
  let text = "";

  for (let property in schema.properties) {
    let newPath = `${path}.${property}`;
    text += `expect(${newPath}).to.exist;\n`;

    if (schema.properties[property].type === "object") {
      text += jsGenerateResponseExpectStatements(schema.properties[property], newPath);
    }
  }

  return text;
}

function generateRequestHeaderTestCode(headerInfo) {
  let headerName = headerInfo.name;
  let variableName = headerName.toUpperCase();
  return `.set('${headerName}', ${variableName})`;
}

function generateResponseHeaderTestCode(headerInfo) {
  let headerName = headerInfo.name;
  let variableName = headerName.toUpperCase();
  return `expect(res).to.have.header(${variableName});`;
}

function jsGenerateHeaderVariable(name, value) {
  let finishedVariable = "";
  let variableName = name.toUpperCase();
  let variableValue = value; // Replace this with the actual value or a variable holding the value

  finishedVariable += `let ${variableName} = '${variableValue}';\n`;

  // Check if the finishedVariable already exists in the array
  if (!definedVariablesAtTopOfFile.includes(finishedVariable)) {
    // If it doesn't exist, add it to the array
    definedVariablesAtTopOfFile.push(finishedVariable);
    return finishedVariable;
  } else {
    // If it does exist, return null
    return null;
  }
}

function replacePathParametersWithVariables(path, names) {
  // Split the path into segments
  let segments = path.split("/");
  // Iterate over the segments
  for (let i = 0; i < segments.length; i++) {
    // If the segment is a parameter
    if (segments[i].startsWith("{") && segments[i].endsWith("}")) {
      // Extract the parameter name
      let paramName = segments[i].slice(1, -1);
      // If the parameter name is in the names array
      if (names.includes(paramName)) {
        paramName = paramName.toUpperCase();
        // Replace the segment with the variable representation
        segments[i] = `" + ${paramName} + "`;
      }
    }
  }
  // Join the segments back into a path
  path = segments.join("/");
  // Return the modified path
  return `"${path}"`;
}

function generateQueryString(name) {
  let nameUpper = name.toUpperCase();
  // If the parameter is in the query, generate a .query() string
  return `.query({ ${name}:${nameUpper} })`;
}

export const javascriptTestTopOfFile = (data) => {
  let javascripttesTopOfFile = "";
  //javascripttesTopOfFile +=  ` \n`;
  javascripttesTopOfFile += `//Please make sure the correct Libaries are installed\n`;
  javascripttesTopOfFile += `const fs = require("fs");\n`;
  javascripttesTopOfFile += `const chai = require("chai");\n`;
  javascripttesTopOfFile += `const chaiHttp = require("chai-http");\n`;
  javascripttesTopOfFile += `const expect = chai.expect;\n`;
  javascripttesTopOfFile += `chai.use(chaiHttp);\n`;
  javascripttesTopOfFile += `const path = require("path");\n`;
  //javascripttesTopOfFile += `const filename = path.basename(__filename);\n`;

  // Extract the server information
  const serverInfo = yamlInteract.getServerInfo(data);

  // Assign the server information to a constant
  for (let i = 0; i < serverInfo.length; i++) {
    javascripttesTopOfFile += `const url = "${serverInfo[0].url}";\n`;
    javascripttesTopOfFile += `const SERVER_${i + 1}_DESCRIPTION = "${serverInfo[i].description}";\n`;
  }

  return javascripttesTopOfFile;
};