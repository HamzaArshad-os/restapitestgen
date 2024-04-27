import fs from "fs";
import yaml from "js-yaml";
import * as statushttp from "statushttp";
import CryptoJS from "crypto-js";
import * as datageneration from "./mockDataGeneration.js";
import * as testHandler from "./testGeneration.js";
import * as fileHandler from "./fileHandling.js";
import $RefParser from "json-schema-ref-parser";

let schemaCounter = 0;
export let uniqueSchemaGenMockData = new Map(); //Holds all unique schemas
export let uniqueSecurityMap = new Map(); //Holds all unique security schemes
export let uniqueHeadersMap = new Map(); //Holds all unique headers
export let schemaErrors = [];

export const endpoint_path = "paths"; // User can change this

export const validDataTypes = ["string", "number", "integer", "boolean"]; //,'object' ,'array' and null should be in here aswell technically , but causes issues when generating bad schemas and mockdata
export const validFormats = [
  "date-time",
  "date",
  "time",
  "email",
  "idn-email",
  "hostname",
  "idn-hostname",
  "ipv4",
  "ipv6",
  "uri",
  "uri-reference",
  "iri",
  "iri-reference",
  "uuid",
  "uri-template",
  "json-pointer",
  "relative-json-pointer",
  "regex",
  "faker",
  "chance",
  "casual",
  "int64",
  "int32",
  "float",
  "double",
  "byte",
  "binary",
  "password",
];
export const validAdditionalProperties = [
  "required",
  "minimum",
  "maximum",
  "multipleOf",
  "exclusiveMinimum",
  "exclusiveMaximum",
  "pattern",
  "maxLength",
  "minLength",
  "maxItems",
  "minItems",
  "uniqueItems",
  "contains",
  "maxProperties",
  "minProperties",
  "dependencies",
  "propertyNames",
  "allOf",
  "anyOf",
  "oneOf",
  "not",
  "readOnly",
  "writeOnly",
];

export let allSchemas = [];

function schemaToHash(schema, name) {
  // Convert the schema and name into a string
  let schemaString = JSON.stringify(schema) + name;

  // Create a hash of the string
  let hash = CryptoJS.SHA256(schemaString);

  // Convert the hash to a hexadecimal string
  let hashString = hash.toString(CryptoJS.enc.Hex);

  return hashString;
}

function headerToHash(header, headerName) {
  // Convert the header and name into a string
  let headerString = JSON.stringify(header) + headerName;

  // Create a hash of the string
  let hash = CryptoJS.SHA256(headerString);

  // Convert the hash to a hexadecimal string
  let hashString = hash.toString(CryptoJS.enc.Hex);

  return hashString;
}

function securitySchemeToHash(securityScheme, securitySchemeName) {
  // Convert the security scheme and name into a string
  let securitySchemeString = JSON.stringify(securityScheme) + securitySchemeName;

  // Create a hash of the string
  let hash = CryptoJS.SHA256(securitySchemeString);

  // Convert the hash to a hexadecimal string
  let hashString = hash.toString(CryptoJS.enc.Hex);

  return hashString;
}

function getContentTypesAndSchemas(section, section_name, endpoint, method, response, spec) {
  let contentTypesAndSchemas = [];

  if (section && section.content) {
    for (let contentType in section.content) {
      let schema = section.content[contentType].schema || null;
      let schemaName = getSchemaName(schema, section, spec) || `${endpoint.replace(/\//g, "")}_${method}_${response}_Schema${schemaCounter++}`;
      contentTypesAndSchemas.push({ contentType: contentType, schema: schema, name: schemaName || `${section_name}${endpoint}_${method}_${response}` });
    }
  } else if (section && section.schema) {
    // If there is no content type but there is a schema, add it with a default content type
    let schema = section.schema;
    let schemaName = schema.name || getSchemaName(schema, section, spec);
    contentTypesAndSchemas.push({ contentType: "No content type for this schema", schema: schema, name: schemaName || `${section_name}${endpoint}_${method}_${response}` });
  }

  // Handle nested schemas
  if (section && typeof section === "object") {
    for (let key in section) {
      if (key !== "schema" && key !== "content") {
        // If the current key is a schema, use the key as the schema name
        if (section[key].schema && !section[key].schema.name) {
          section[key].schema.name = key;
        }
        contentTypesAndSchemas = contentTypesAndSchemas.concat(getContentTypesAndSchemas(section[key], `${section_name}${key}_`, endpoint, method, response, spec));
      }
    }
  }

  return contentTypesAndSchemas;
}

function handleSchemasV2(schema, endpoint, method, responseCode, schemaName, contentType = "", location = "", paramterSpecfic = "") {
  let schemaCounterForUnnamedSchemas = 0;
  if (typeof schema === "object" && schema !== null) {
    if (schema.type) {
      // This looks like a schema
      let error = validateSchema(schema);
      if (error) {
        schemaErrors.push({ error, endpoint, method, location });
      } else {
        // Starting of schema handling

        // Worst case for schemaName could not be retrieved
        if (schemaName === "") {
          schemaName = `${path.replace(/\//g, "")}_${method}_Schema${schemaCounterForUnnamedSchemas++}`;
        }

        // Generate a schemaKey using hash functions
        let schemaKey = schemaToHash(schema, schemaName);

        let info = {
          name: schemaName,
          schemaKey: schemaKey,
          usage: [
            {
              path: endpoint,
              method: method,
              response: responseCode,
              contentType: contentType,
              location: location,
              inPathOrQuery: paramterSpecfic,
            },
          ],
          goodSchema: schema,
        };

        // Check if the schema already exists in the map
        let existingSchemaInfo = uniqueSchemaGenMockData.get(schemaKey);
        if (existingSchemaInfo) {
          // If the schema already exists in the map, update the existing entry
          existingSchemaInfo.usage.push(...info.usage);
        } else {
          // If the schema does not exist in the map, add the new entry
          uniqueSchemaGenMockData.set(schemaKey, info);
          allSchemas.push(info);
          handleGoodSchemaAndMockData(schema, schemaName, schemaKey, info);
          handleBadSchemaAndMockData(schema, schemaName, info);
        }
      }
    }
  } else {
    //console.log("Schema is not an object");
  }
}

function handleHeaders(header, endpoint, method, foundAt, headerName, response) {
  // Generate a headerKey using hash functions
  let headerKey = headerToHash(header, headerName);

  let info = {
    name: headerName,
    headerKey: headerKey,
    usage: [
      {
        path: endpoint,
        method: method,
        response: response,
        foundAt: foundAt,
      },
    ],
    header: header,
  };

  // Check if the header already exists in the map
  let existingHeaderInfo = uniqueHeadersMap.get(headerKey);
  if (existingHeaderInfo) {
    // If the header already exists in the map, update the existing entry
    // Check if the usage info already exists
    let duplicateUsage = existingHeaderInfo.usage.find((usage) => usage.path === endpoint && usage.method === method && usage.response === response && usage.foundAt === foundAt);
    // If the usage info does not exist, add it
    if (!duplicateUsage) {
      existingHeaderInfo.usage.push(...info.usage);
    }
  } else {
    // If the header does not exist in the map, add the new entry
    uniqueHeadersMap.set(headerKey, info);
  }
}

function handleSecurity(securityScheme, endpoint, method, response) {
  // Generate a securityKey using hash functions
  let securityKey = securitySchemeToHash(securityScheme, securityScheme.name);

  let info = {
    name: securityScheme.name,
    securityKey: securityKey,
    usage: [
      {
        path: endpoint,
        method: method,
        response: response,
      },
    ],
    securityScheme: securityScheme,
  };

  // Check if the security scheme already exists in the map
  let existingSecurityInfo = uniqueSecurityMap.get(securityKey);
  if (existingSecurityInfo) {
    // If the security scheme already exists in the map, update the existing entry
    let existingUsage = existingSecurityInfo.usage.find((u) => u.path === endpoint && u.method === method && u.response === response);
    if (!existingUsage) {
      existingSecurityInfo.usage.push(...info.usage);
    }
  } else {
    // If the security scheme does not exist in the map, add the new entry
    uniqueSecurityMap.set(securityKey, info);
  }
}

function getParametersSection(spec, endpoint, method, responseCode) {
  if (spec.paths[endpoint] && spec.paths[endpoint][method] && spec.paths[endpoint][method].parameters) {
    let parametersSection = spec.paths[endpoint][method].parameters;
    let [headers, headerNames, headerSchemas] = getHeaders(spec, endpoint, method, responseCode);
    if (headers.parameters) {
      headers.parameters.forEach((header, index) => {
        handleHeaders(header, endpoint, method, "paramters_", headerNames.parameters[index], responseCode);
      });
    }
    parametersSection.forEach((parameter) => {
      let schemasandContentType = getContentTypesAndSchemas(parameter, "paramters_", endpoint, method, responseCode, spec);
      schemasandContentType.forEach(({ name, schema, contentType }) => {
        handleSchemasV2(schema, endpoint, method, responseCode, name, contentType, "parameters", parameter.in);
      });
    });
    return [parametersSection, headers];
  }
  return [[], []];
}

function getRequestBodySection(spec, endpoint, method, responseCode) {
  if (spec.paths[endpoint] && spec.paths[endpoint][method] && spec.paths[endpoint][method].requestBody) {
    let requestBodySection = spec.paths[endpoint][method].requestBody;
    let schemasandContentType = getContentTypesAndSchemas(requestBodySection, "requestBody_", endpoint, method, responseCode, spec);
    schemasandContentType.forEach(({ name, schema, contentType }) => {
      handleSchemasV2(schema, endpoint, method, responseCode, name, contentType, "requestBody");
    });
    return [requestBodySection];
  }
  return [[]];
}

function getResponseSection(spec, endpoint, method, responseCode) {
  if (spec.paths[endpoint] && spec.paths[endpoint][method] && spec.paths[endpoint][method].responses && spec.paths[endpoint][method].responses[responseCode]) {
    let responseSection = spec.paths[endpoint][method].responses[responseCode];
    let [headers, headerNames, headerSchemas] = getHeaders(spec, endpoint, method, responseCode);

    if (headers.responseHeaders) {
      Object.entries(headers.responseHeaders).forEach(([name, header]) => {
        handleHeaders(header, endpoint, method, `response_${responseCode}`, name, responseCode);
      });
    }
    let schemasandContentType = getContentTypesAndSchemas(responseSection, "response_", endpoint, method, responseCode, spec);
    schemasandContentType.forEach(({ name, schema, contentType }) => {
      handleSchemasV2(schema, endpoint, method, responseCode, name, contentType, "response");
    });
    return [responseSection, headers];
  }
  return [[], []];
}

function getSecurity(spec, endpoint, method, response) {
  let security = null;

  // Retrieve security information
  if (spec.paths[endpoint] && spec.paths[endpoint][method] && spec.paths[endpoint][method].security) {
    security = spec.paths[endpoint][method].security;

    // Look up each security scheme in components.securitySchemes
    security = security.map((scheme) => {
      let schemeName = Object.keys(scheme)[0];
      let securityScheme = spec.components.securitySchemes[schemeName];

      // If the security scheme is located in the header, handle it as a header
      if (securityScheme.in === "header") {
        handleHeaders(securityScheme, endpoint, method, "header", schemeName, response);
      } else {
        // If the security scheme is not in the header, handle it as security
        handleSecurity(securityScheme, endpoint, method);
      }

      return securityScheme;
    });
  }

  return security;
}

export const handleGoodSchemaAndMockData = (schema, schemaName, schemaKey, info) => {
  // Add the good schema to the map
  //uniqueSchemaGenMockData.set(JSON.stringify(node), info);

  // Generate a new file for the schema and store the file path
  let mostRecentContentType = info.usage[info.usage.length - 1].contentType;
  //console.log(mostRecentContentType);
  //console.log("Schema: "+JSON.stringify(schema));
  //console.log(JSON.stringify(info.usage));
  let goodSchemaFilePath = fileHandler.generateSchemaFileInsertContent(schema, schemaName, "goodSchemas", mostRecentContentType);
  info.goodSchemaFilePath = goodSchemaFilePath;

  // Generate the MockData for the good schema
  let generatedGoodMockDataForSchema = datageneration.generateMockData(schema, info.name, "goodMockData", mostRecentContentType);

  // Generate a new file for the mock data and store the file path
  let goodMockDataFilePath = fileHandler.generateMockDataFileInsertContent(generatedGoodMockDataForSchema, schemaName, "goodMockData");
  info.goodMockDataFilePath = goodMockDataFilePath;

  // Add the generated good mock data to the map
  uniqueSchemaGenMockData.get(schemaKey).goodMockData = generatedGoodMockDataForSchema;
};

export const handleBadSchemaAndMockData = (node, schemaName, info) => {
  let modifiedSchemas = GenerateBadSchema(node, schemaName, info);

  // Iterate over each type of modification
  Object.keys(modifiedSchemas).forEach((type) => {
    let mostRecentContentType = info.usage[info.usage.length - 1].contentType;
    let allModifiedSchemas = [];
    let allMockData = [];

    // For each type, iterate over the array of modified schemas
    modifiedSchemas[type].forEach((badSchema, index) => {
      let generatedBadMockDataForSchema = datageneration.generateMockData(badSchema, info.name, "badMockData", mostRecentContentType);

      allModifiedSchemas.push(badSchema);
      allMockData.push(generatedBadMockDataForSchema);
    });

    // Generate a new file for the schemas and add the bad schemas
    let badschemaFilePath = fileHandler.generateSchemaFileInsertContent(allModifiedSchemas, schemaName, `badSchema_${type}`, mostRecentContentType);
    info[`badSchemaFilePath_${type}`] = badschemaFilePath;

    // Generate a mock data file containing all the bad mock data
    let badMockDataFilePath = fileHandler.generateMockDataFileInsertContent(allMockData, schemaName, `badMockData_${type}`);
    info[`badMockDataFilePath_${type}`] = badMockDataFilePath;
  });
};

//Entry point
export const readAndPreprocessYamlFile = async (yamlFile) => {
  let fileContents = fs.readFileSync(yamlFile, "utf8");
  let data = yaml.load(fileContents);
  //console.log(JSON.stringify(data, null, 2));
  data = await $RefParser.dereference(data);
  //console.log(JSON.stringify(data, null, 2));
  //console.log("Data has been dereferenced");
  // Process all subsections of schemas in the components section
  //handleComponentSchemas(data);
  generateCondensedDataListAndPreprocessV2(data);
  testHandler.testgenerationEntryPoint(data);
  return data;
};

export const handleComponentSchemas = (data) => {
  if (data.components) {
    for (let componentType in data.components) {
      for (let schemaName in data.components[componentType]) {
        let schemaContent = data.components[componentType][schemaName];
        //console.log(schemaContent,schemaContent);
        handleSchemasV2(schemaContent, "Components.Schemas", "Components.Schemas", "Components.Schemas", schemaName, "", "components", "");
      }
    }
  }
};

export const generateCondensedDataListAndPreprocessV2 = (data) => {
  let endpointList = {};

  for (let path in data.paths) {
    endpointList[path] = {};
    for (let method in data.paths[path]) {
      endpointList[path][method] = {};
      for (let response in data.paths[path][method].responses) {
        getParametersSection(data, path, method, response);
        getRequestBodySection(data, path, method, response);
        getResponseSection(data, path, method, response);
        getHeaders(data, path, method, response);
        getSecurity(data, path, method, response);
      }
    }
  }
};

function getHeaders(spec, endpoint, method, responseCode) {
  let headers = {};
  let headerNames = {};
  let headerSchemas = {};

  // Retrieve header parameters
  if (spec.paths[endpoint] && spec.paths[endpoint][method] && spec.paths[endpoint][method].parameters) {
    headers.parameters = spec.paths[endpoint][method].parameters.filter((param) => param.in === "header");
    headerNames.parameters = headers.parameters.map((param) => param.name);
    headerSchemas.parameters = headers.parameters.map((param) => param.schema);
  }

  // Retrieve response headers for a specific response code
  if (
    spec.paths[endpoint] &&
    spec.paths[endpoint][method] &&
    spec.paths[endpoint][method].responses &&
    spec.paths[endpoint][method].responses[responseCode] &&
    spec.paths[endpoint][method].responses[responseCode].headers
  ) {
    headers.responseHeaders = spec.paths[endpoint][method].responses[responseCode].headers;
    headerNames.responseHeaders = Object.keys(headers.responseHeaders);
    headerSchemas.responseHeaders = Object.values(headers.responseHeaders).map((header) => header.schema);
  }

  // Retrieve globally defined headers
  if (spec.components && spec.components.headers) {
    headers.globalHeaders = spec.components.headers;
    headerNames.globalHeaders = Object.keys(headers.globalHeaders);
    headerSchemas.globalHeaders = Object.values(headers.globalHeaders).map((header) => header.schema);
  }

  // Handle each header
  // Handle each header
  for (let foundAt in headers) {
    if (Array.isArray(headers[foundAt])) {
      headers[foundAt].forEach((header, index) => {
        handleHeaders(header, endpoint, method, foundAt, headerNames[foundAt][index], responseCode);
      });
    }
  }
  return [headers, headerNames, headerSchemas];
}

function getSchemaName(schema, section, spec) {
  let schemaName;
  if (schema.title) {
    // If there is a title, use the title as the schema name
    schemaName = schema.title;
  } else if (schema.name) {
    // If there is no title but there is a name, use the name as the schema name
    schemaName = schema.name;
  } else if (section.name) {
    // If there is no title or name in the schema, but there is a name in the section, use it as the schema name
    schemaName = section.name;
  } else {
    try {
      // If there is no title or name, check if the schema exists in components.schemas
      for (let key in spec.components.schemas) {
        if (JSON.stringify(spec.components.schemas[key]) === JSON.stringify(schema)) {
          schemaName = key;
          break;
        }
      }
    } catch (error) {
      //console.log("Schema name could not be found No componets section ");
      schemaName = "";
    }
  }

  // If no name was found, set the schema name to a default value
  if (!schemaName) {
    schemaName = "";
  }

  return schemaName;
}

export const generateCondensedDataList = (data) => {
  let endpointList = {};

  for (let path in data[endpoint_path]) {
    endpointList[path] = {};
    for (let method in data[endpoint_path][path]) {
      endpointList[path][method] = [];
      for (let response in data[endpoint_path][path][method].responses) {
        endpointList[path][method].push(response);
      }
    }
  }

  return endpointList;
};

function validateSchema(schema) {
  try {
    if (!validDataTypes.includes(schema.type) && ["null", "object", "array"].indexOf(schema.type) === -1) {
      //have to handle some seperaterly
      return `Invalid data type: ${schema.type}`;
    }
  } catch (error) {
    return null;
  }
  try {
    if (schema.format && !validFormats.includes(schema.format)) {
      return `Invalid format: ${schema.format}`;
    }
  } catch (error) {
    return null;
  }

  try {
    if (schema.additionalProperties) {
      for (let key in schema.additionalProperties) {
        if (!validAdditionalProperties.includes(key)) {
          return `Invalid additional property: ${key}`;
        }
      }
    }
  } catch (error) {
    return null;
  }
}

export const getContentAtIndex = (map, index) => {
  let i = 0;
  for (let [key, value] of map.entries()) {
    if (i === index) {
      return { key, value }; // Return the entire entry if the index matches
    }
    i++;
  }
  return null; // Return null if no entry is found at the given index
};

export const iterateOverMapGetSpecificSection = (maptoToRead, sectionName) => {
  let returnArray = [];
  let index = 0;
  for (let [key, value] of maptoToRead.entries()) {
    let section = extraSectionFromMap(value, sectionName);
    if (section !== null) {
      returnArray.push({ index: index, section: JSON.stringify(section) });
    }
    index++;
  }
  return returnArray;
};

function extraSectionFromMap(item, sectionName) {
  if (item.hasOwnProperty(sectionName)) {
    return item[sectionName];
  } else {
    //console.log(`The item does not have a section named "${sectionName}"`);
    return null;
  }
}

export const getuniqueInfoAtIndex = (map, index, sectionName) => {
  let i = 0;
  for (let [key, value] of map.entries()) {
    if (i === index) {
      let section = extraSectionFromMap(value, sectionName);
      if (section !== null) {
        return section;
        //return JSON.stringify(section ,null ,2); // Return the section if it exists
      }
      return null; // Return null if the section does not exist
    }
    i++;
  }
  return null; // Return null if no matching schema info is found
};

export const getServerInfo = (data) => {
  let serverInfo = [];
  if (data.servers) {
    for (let server of data.servers) {
      serverInfo.push({
        url: server.url,
        description: server.description,
      });
    }
  }
  if (!serverInfo.length || !serverInfo[0].url) {
    return [{ url: "no url" }];
  }
  return serverInfo;
};

export const getStatusDescription = (statusCode) => {
  return statushttp.statusDesc[statusCode];
};

export const printuniqueSchemaGenMockData = () => {
  for (let [schema, info] of uniqueSchemaGenMockData.entries()) {
    console.log("--------------------------");
    console.log(`${JSON.stringify(info, null, 2)}`);
    //break;
    //console.log(`Schema: ${JSON.stringify(JSON.parse(schema), null, 2)}`);
  }
};

export const printUniqueHeadersMap = () => {
  for (let [header, info] of uniqueHeadersMap.entries()) {
    console.log("--------------------------");
    console.log(`${JSON.stringify(info, null, 2)}`);
  }
};

export const printUniqueSecurityMap = () => {
  for (let [securityScheme, info] of uniqueSecurityMap.entries()) {
    console.log("--------------------------");
    console.log(`${JSON.stringify(info, null, 2)}`);
  }
};

export const GenerateBadSchema = (schema, schemaName, info) => {
  //This will need completely changing in the future to allow for users to generate their own bad schemas
  let returnedModififiedSchemas = [];
  let modificationTypes = [];

  // Recursive function to handle nested properties
  const defineProperterty = (nestedSchema, path = []) => {
    for (let key in nestedSchema) {
      if (nestedSchema.hasOwnProperty(key)) {
        let newPath = path.concat(key).join(".");

        // Special case for 'required' property
        if (key === "required") {
          for (let requiredKey of nestedSchema[key]) {
            // Call schema modification functions here if necessary
          }
        }

        // Special case for 'example' property
        if (key === "example") {
          // ignore for now
        }

        // Detect if the line is of a specific format
        if (nestedSchema[key] && validFormats.includes(nestedSchema[key].format)) {
          // Call violateFormat() here
        }

        // Detect if the line is of a specific datatype
        if (nestedSchema[key] && validDataTypes.includes(nestedSchema[key].type)) {
          let changedDataTypeSchema = changeDataType(schema, newPath);
          if (changedDataTypeSchema) {
            returnedModififiedSchemas.push(changedDataTypeSchema);
            modificationTypes.push("changedDataType"); // Store the type of modification
          }
          //Add more modifcations to the schema strcture here, Can place your own make fucntion that take sin a schema and modifes the datatypes to your preference. If wish to modify format  or addional prperites, same thing in other sections above or below this if statement
        }

        // Detect if the line is an additional property
        if (nestedSchema[key] && nestedSchema[key].hasOwnProperty("additionalProperties")) {
          // Call setEmptyValues() or setNullValues() here
        }

        // If the value is an object, call the function recursively
        if (typeof nestedSchema[key] === "object" && nestedSchema[key] !== null) {
          defineProperterty(nestedSchema[key], newPath.split("."));
        }
      }
    }
  };

  defineProperterty(schema);

  // Create an object to hold the modified schemas
  let modifiedSchemas = {};

  // Iterate over the returned modified schemas
  for (let i = 0; i < returnedModififiedSchemas.length; i++) {
    let type = modificationTypes[i];
    let modifiedSchema = returnedModififiedSchemas[i];

    // If this type of modification doesn't exist yet, create an array for it
    if (!modifiedSchemas[type]) {
      modifiedSchemas[type] = [];
    }

    // Add the modified schema to the array for its type
    modifiedSchemas[type].push(modifiedSchema);
  }

  return modifiedSchemas;
};

function changeDataType(schema, path) {
  // Create a deep copy of the schema
  let newSchema = JSON.parse(JSON.stringify(schema));

  // Split the path and reduce it to the property that needs to be changed
  let pathArray = path.split(".");
  let propertyToChange = pathArray.reduce((obj, key) => obj[key], newSchema);

  // Get the index of the current datatype in the validDataTypes array
  let currentIndex = validDataTypes.indexOf(propertyToChange.type);

  // Choose a different datatype
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * validDataTypes.length);
  } while (newIndex === currentIndex);

  propertyToChange.type = validDataTypes[newIndex];

  return newSchema;
}

function changeDataTypev2(schema, path) {
  // Create a deep copy of the schema
  let newSchema = JSON.parse(JSON.stringify(schema));

  // Split the path and reduce it to the property that needs to be changed
  let pathArray = path.split(".");
  let propertyToChange = pathArray.reduce((obj, key) => obj[key], newSchema);

  // Get the index of the current datatype in the validDataTypes array
  let currentIndex = validDataTypes.indexOf(propertyToChange.type);

  // Choose a different datatype
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * validDataTypes.length - 1);
  } while (newIndex === currentIndex);

  propertyToChange.type = validDataTypes[newIndex];

  return newSchema;
}
