import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";

export const defaultfileType = "json";

export const createDirectoriesForOutputs = () => {
  // Get the current file's directory
  const currentDirectory = dirname(fileURLToPath(import.meta.url));

  // Construct the new directory path
  const parentDirectory = join(currentDirectory, "GeneratedContent");

  // Check if the parent directory already exists
  if (!existsSync(parentDirectory)) {
    // Create the parent directory
    mkdirSync(parentDirectory);
    //console.log(`Parent Directory created successfully.`);
  } else {
    //console.log(`Parent Directory already exists.`);
  }

  // Get the list of directories inside the parent directory
  const directories = readdirSync(parentDirectory, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  // Generate a new directory named "RunX", where X is the number of existing directories plus 1
  const newRunDirectory = join(parentDirectory, `Run${directories.length + 1}`);

  // Create the new directory
  mkdirSync(newRunDirectory);
  //console.log(`New directory "${newRunDirectory}" created successfully.`);

  // Get the updated list of directories inside the parent directory
  const updatedDirectories = readdirSync(parentDirectory, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  // Check if there are any directories inside the parent directory
  if (updatedDirectories.length > 0) {
    //console.log(`The parent directory contains the following directories: ${updatedDirectories.join(', ')}`);
  } else {
    //console.log(`The parent directory does not contain any directories.`);
  }
};

export const createSubDirectories = () => {
  // Get the most recent directory
  const mostRecentDirectory = getMostRecentDirectory();

  // Check if the most recent directory exists
  if (mostRecentDirectory) {
    // Construct the new directory paths
    const generatedSchemasDirectory = join(mostRecentDirectory, "GeneratedSchemas");
    const generatedMockDataDirectory = join(mostRecentDirectory, "GeneratedMockData");

    // Create the new directories
    if (!existsSync(generatedSchemasDirectory)) {
      mkdirSync(generatedSchemasDirectory);
      //console.log(`New directory "${generatedSchemasDirectory}" created successfully.`);
    } else {
      //console.log(`Directory "${generatedSchemasDirectory}" already exists.`);
    }

    if (!existsSync(generatedMockDataDirectory)) {
      mkdirSync(generatedMockDataDirectory);
      //console.log(`New directory "${generatedMockDataDirectory}" created successfully.`);
    } else {
      //console.log(`Directory "${generatedMockDataDirectory}" already exists.`);
    }
  } else {
    //console.log("The most recent directory does not exist.");
  }
};

export const getMostRecentDirectory = () => {
  try {
    // Get the current file's directory
    const currentDirectory = dirname(fileURLToPath(import.meta.url));

    // Construct the parent directory path
    const parentDirectory = join(currentDirectory, "GeneratedContent");

    // Get the list of directories inside the parent directory
    const directories = readdirSync(parentDirectory, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    // Sort the directories by the run number (assuming the format is "RunX")
    const sortedDirectories = directories.sort((a, b) => {
      const runNumberA = parseInt(a.replace("Run", ""));
      const runNumberB = parseInt(b.replace("Run", ""));

      return runNumberB - runNumberA;
    });

    // Return the relative path of the most recent directory
    return join(parentDirectory, sortedDirectories[0]);
  } catch (err) {
    //console.log("Directory has not been created yet")
    return null;
  }
};

function extractFileTypeForFileGeneration(contentType) {
  let fileType;
  //console.log(contentType);

  // Check if contentType is an empty string
  if (contentType === undefined) {
    // If it is, set fileType to the default fileType
    fileType = defaultfileType;
  } else {
    // If it's not, split the contentType string on the slash
    let parts = contentType.split("/");

    // The second part (index 1) is the fileType
    fileType = parts[1];
  }

  return fileType;
}

export const generateSchemaFileInsertContent = (schema, schemaName, typeOfSchema, contentType) => {
  // Get the most recent directory
  const mostRecentDirectory = getMostRecentDirectory();
  let fileType = extractFileTypeForFileGeneration(contentType);

  // Check if the most recent directory exists
  if (mostRecentDirectory) {
    // Construct the new directory path for the schema files
    const schemaDirectory = join(mostRecentDirectory, "GeneratedSchemas", typeOfSchema);

    // Check if the schema directory already exists
    if (!existsSync(schemaDirectory)) {
      // Create the schema directory
      mkdirSync(schemaDirectory, { recursive: true });
    }

    // Create a new file with the provided schema name and type of schema
    //currently only handles.json file type.Big bugs otherwise
    const newSchemaFile = join(schemaDirectory, `${schemaName}_${typeOfSchema}.${defaultfileType}`);

    // Create the new file with the provided schema
    writeFileSync(newSchemaFile, JSON.stringify(schema, null, 2), "utf8");

    // Return the file path
    return newSchemaFile;
  } else {
    console.log("The most recent directory does not exist.");
    return null;
  }
};

export const generateMockDataFileInsertContent = (mockData, mockDataName, typeOfMockData, contentType) => {
  // Get the most recent directory
  const mostRecentDirectory = getMostRecentDirectory();
  let fileType = extractFileTypeForFileGeneration(contentType);

  // Check if the most recent directory exists
  if (mostRecentDirectory) {
    // Construct the new directory path based on the type of mock data
    const mockDataDirectory = join(mostRecentDirectory, "GeneratedMockData", typeOfMockData);

    // Check if the mock data directory already exists
    if (!existsSync(mockDataDirectory)) {
      // Create the mock data directory
      mkdirSync(mockDataDirectory, { recursive: true });
    }

    // Create a new file with the provided mock data name and type of mock data
    const newMockDataFile = join(mockDataDirectory, `${mockDataName}_${typeOfMockData}.${fileType}`);

    // Create the new file with the provided mock data
    writeFileSync(newMockDataFile, JSON.stringify(mockData, null, 2), "utf8");

    // Return the file path
    return newMockDataFile;
  } else {
    console.log("The most recent directory does not exist.");
    return null;
  }
};

export const generateJavaScriptFileInsertContent = (fileName, content) => {
  // Get the most recent directory
  const mostRecentDirectory = getMostRecentDirectory();

  // Check if the most recent directory exists
  if (mostRecentDirectory) {
    // Construct the new directory path for the JavaScript files
    const jsDirectory = join(mostRecentDirectory, "GeneratedTests");

    // Check if the JavaScript directory already exists
    if (!existsSync(jsDirectory)) {
      // Create the JavaScript directory
      mkdirSync(jsDirectory, { recursive: true });
      //console.log(`New directory "${jsDirectory}" created successfully.`);
    } else {
      //console.log(`Directory "${jsDirectory}" already exists.`);
    }

    // Replace reserved characters in the filename and trim spaces
    let safeFileName = fileName.replace(/[:\\\/{}]/g, "");
    safeFileName = safeFileName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // Create a new file with the provided file name
    const newJsFile = join(jsDirectory, `${safeFileName}.js`);

    // Create the new file with the provided content
    writeFileSync(newJsFile, content, "utf8");

    // Return the file path
    return newJsFile;
  } else {
    console.log("The most recent directory does not exist.");
    return null;
  }
};


