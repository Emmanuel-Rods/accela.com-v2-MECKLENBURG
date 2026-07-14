const fs = require("fs").promises; // Use the promises version of fs
const path = require("path");

async function cleanJSONinFolder(inputFolder, outputFolder) {
  try {
    // 1. Ensure output directory exists (await)
    await fs.mkdir(outputFolder, { recursive: true });

    // 2. Read directory (await)
    const allFiles = await fs.readdir(inputFolder);
    const jsonFiles = allFiles.filter((file) => file.endsWith(".json"));

    console.log(`Starting simple cleanup on ${jsonFiles.length} files...`);

    // 3. Process files in a loop
    // Note: Use a for...of loop with await to ensure they process correctly
    for (const filename of jsonFiles) {
      const filePath = path.join(inputFolder, filename);

      try {
        const rawData = await fs.readFile(filePath, "utf-8");
        let data = JSON.parse(rawData);

        // --- TARGET 1: Drop empty applicationInformation ---
        delete data["applicationInformation"];

        // --- TARGET 2: Drop TOWNHOUSE ADDRESSES ---
        if (data.applicationInformationTables) {
          delete data.applicationInformationTables["TOWNHOUSE ADDRESSES"];
        }

        // --- TARGET 3: Drop legal sentence ---
        const contractors =
          data.applicationInformationTables?.["CONTRACTOR INFORMATION"];
        if (Array.isArray(contractors)) {
          const legalSentence =
            "By Selecting Yes, You are certifying that this information is correct";
          contractors.forEach((contractor) => {
            delete contractor[legalSentence];
          });
        }

        // 4. Save file (await)
        const outputFilePath = path.join(outputFolder, filename);
        await fs.writeFile(
          outputFilePath,
          JSON.stringify(data, null, 2),
          "utf-8",
        );
      } catch (err) {
        console.error(`Error processing ${filename}: ${err.message}`);
      }
    }

    console.log("-".repeat(40));
    console.log("CLEANUP COMPLETE");
    return true; // Return something to signal completion
  } catch (err) {
    console.error(`Critical Error: ${err.message}`);
    throw err;
  }
}

function cleanJSON(rawData) {
  let data = rawData;

  // --- TARGET 1: Drop empty applicationInformation ---
  delete data["applicationInformation"];

  // --- TARGET 2: Drop TOWNHOUSE ADDRESSES ---
  if (data.applicationInformationTables) {
    delete data.applicationInformationTables["TOWNHOUSE ADDRESSES"];
  }

  // --- TARGET 3: Drop legal sentence ---
  const contractors =
    data.applicationInformationTables?.["CONTRACTOR INFORMATION"];
  if (Array.isArray(contractors)) {
    const legalSentence =
      "By Selecting Yes, You are certifying that this information is correct";
    contractors.forEach((contractor) => {
      delete contractor[legalSentence];
    });
  }

  return data;
}

module.exports = { cleanJSONinFolder, cleanJSON };
