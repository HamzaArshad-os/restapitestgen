
import * as yamlInteract from "./yamlInteract.js";
import * as testgenerator from "./testGeneration.js";
import * as datageneration from "./mockDataGeneration.js";
import * as fileHandler from "./fileHandling.js";

export let language = "javascript";

export const setEndPointPath = (newPath) => {
  yamlInteract.endpoint_path = newPath;
};

export const setSchemasPath = (newPath) => {
  yamlInteract.endpoint_path = newPath;
};




  //Insert your specification here
  //const yourSpecifciationYAMLFile = "Project/specificationExamples/petStoreSpec.yaml";
  //const yourSpecifciationYAMLFile = "Project/specificationExamples/generalSpecification.yaml";
  const yourSpecifciationYAMLFile = "Project/specificationExamples/tradingviewSpecResolvedOnly.yaml";
  // const yourSpecifciationYAMLFile = "Project/specificationExamples/exampleYAMLResolved.yaml";
  // const yourSpecifciationYAMLFile = "Project/specificationExamples/exampleFullyResolved2.yaml";
  //const yourSpecifciationYAMLFile = "Project/specificationExamples/exampleYAMLUnresolved.yaml";
  //const yourSpecifciationYAMLFile = "Project/specificationExamples/exampleYAMLResolved2MultiShema.yaml";



export async function main(yourSpecifciationYAMLFile) {
  let yamlFile = yourSpecifciationYAMLFile;
  fileHandler.createDirectoriesForOutputs();
  fileHandler.createSubDirectories();

  let data = "";



  try {
    console.log(
      "This may take a moment depending on the size of your specification, If nothing happens after 30 SECONDS AN Issue has arised. Please check the generated schemas and mock data in the GeneratedContent folder.Suspect an issue with the schemas not being handled by JSF in the correct manner. Note this tool currently only supports JSON based schemas, mockData and hence filetypes, If your specifciation includes non application/json datatypes it will throw an error This tool will throw an error if your specification holds circular refrences, Currently only handles YAML format specs"
    );
    console.log(
      "Currently only has support for YAML 3.0.0 openapi specifications. Feel free to make modifications to js.options to suit your needs. if you want to generate more or less mock data for each schema, change the count variable in the mockDataGeneration file.  "
    );
    console.log("Has support for both Resolved and Unresolved specifications.  ");
    console.log(
      "This tool uses the JSON-Schema-Faker libary which has the ability to generate mock data using Chance and Faker libarys. Highly recommend you look through the JSON-Schema-Faker documentation to see how you can customise the mock data generation to better suit your needs (https://github.com/json-schema-faker/json-schema-faker/tree/d4403ae6cdba2206fe86399900c4095de8db7d2a/docs) "
    );

    data = await yamlInteract.readAndPreprocessYamlFile(yamlFile);

    //yamlInteract.printuniqueSchemaGenMockData()
    // yamlInteract.printUniqueHeadersMap();
    //yamlInteract.printUniqueSecurityMap();
    //console.log(yamlInteract.iterateOverMapGetSpecificSection(yamlInteract.uniqueSchemaGenMockData, 'usage'));
    console.log("-----------------------");
    console.log("Completed.. See generated files for Schemas retrived, gneerated mock data, generated bad mock data and test files.");
    console.log(
      "Note that this tool is designed to take information from an openapi specification, and generate Response and Response structure based tests. Cureently only have support for JSON mock data and Javascript Chai based tests. It can only retrive information from the specification. You will still need to make modfications to the test files to ensure they are correct for your use case."
    );
  } catch (error) {
    console.error(error);
  }
}




//main(yourSpecifciationYAMLFile);