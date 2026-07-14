const getDataByStatus = require("./db/getPreviousData.js");
const fetchPermitData = require("./permit_processors/permit.js");
const { comparePermitHashes } = require("./utils/hashes/hash.compare.js");
const uploadFolder = require("./db/upload.js");
const cleanupFolders = require("./utils/deleteFolders.js");

const fs = require("fs");

const status = "Inspection Phase";

async function main() {
  const file = await getDataByStatus(status); //return filename
  await fetchPermitData(file);
  await comparePermitHashes(file, "permits", "DIFF_FOLDER");
  await uploadFolder("DIFF_FOLDER");
  await cleanupFolders(["DIFF_FOLDER", "permits"]);
  fs.rmSync(file, { force: true }); // remove inspection phase.json
}

main();
