const parseCSVToJSON = require("./utils/CSVJSON.js");
const processRecords = require("./record_processors/process.js");
const fetchPermitData = require("./permit_processors/permit.js");
const { cleanJSON } = require("./utils/cleaner.js");
const uploadFolder = require("./db/upload.js");
const cleanupFolders = require("./utils/deleteFolders.js");
const { downloadCSV } = require("./download_csv/main.js");

const fs = require("fs").promises;

const dateOffset = 1;

const requiredSecondaryData = [
  "Residential New Construction Permit",
  "Residential Addition Permit",
  "Commercial New Construction Permit",
];

async function main() {
  const csv = await downloadCSV(dateOffset);

  if (!csv) {
    throw new Error("Failed to Download CSV");
  }

  const INPUT_FILE = "daily.csv"; // downloadCSV function saves content in this file
  const input_data = await fs.readFile(INPUT_FILE, "utf-8");
  const dailyData = parseCSVToJSON(input_data);

  // filtering by applications
  const filteredApplications = dailyData.filter((app) =>
    requiredSecondaryData.includes(app["Record Type"]),
  );

  // if there are no applications after filtering
  if (filteredApplications.length === 0) {
    console.log("No Applications left for processing after filtering");
    return;
  }

  console.log(
    `fetched ${dailyData.length} total permits, ${filteredApplications.length} passed all filters`,
  );

  await fs.writeFile(
    "daily_permits.json",
    JSON.stringify(filteredApplications, null, 2),
  );
  // need to get the ids
  await processRecords("daily_permits.json", "daily_permits_record_id.json");
  // // once ids
  await fetchPermitData("daily_permits_record_id.json");
  await uploadFolder("permits");
  await cleanupFolders(["permits"]);

  await fs.rm("daily_permits_record_id.json", { force: true });
  await fs.rm("daily_permits.json", { force: true });
}

main();
