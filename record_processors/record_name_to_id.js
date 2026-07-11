const buildBasicPayload = require("../payload_processors/payload.js");
const recordIDPayloadBuilder = require("./record_id_payload.js");

const postToServer = require("../utils/post.js");
const parseAccelaRedirect = require("./redirect_parser.js");

const fs = require("fs");
const path = require("path");

const cookie_string =
  "ACA_USER_PREFERRED_CULTURE=en-US; ApplicationGatewayAffinityCORS=f1d08f118230de263157e2af7da41687; ApplicationGatewayAffinity=f1d08f118230de263157e2af7da41687; ACA_SS_STORE=lnnrsgexjka4mtlhhwpkyeav; ACA_CS_KEY=5439c7312d684a5aac8b9eb8d3bedf9c; _cfuvid=f3EcTgkH1LaORrZRH2w2MNIsNt.G57c7pgWPN1xuZpo-1780641572.3505764-1.0.1.1-iD3I2FFhvAfUgZNS97D6NnOBvC.s_zhUL6CDZqY1XMk; .ASPXANONYMOUS=ggEDLvsKo06egfzSq_SRN1zOea5yK28GOmojInYBPy7-17aysDlkd9If1bQKHsHM_hqjpPbXJD5_c8w469l5GsZyFgtRjcbNDLXgNAxfldXY8VrjGN8UioL3zp2V4OU9WedeeeyAfIipIUwUAdoCfhlQH481; LASTEST_REQUEST_TIME=1780648935850; _dd_s=rum=0&expire=1780646243290";

const TARGET_URL =
  "https://aca-prod.accela.com/MECKLENBURG/Cap/CapHome.aspx?module=Building&TabName=Building&TabList=CodeEnforcement%7c0%7cBuilding%7c1%7cAEGrading%7c2%7cLandDevelopment%7c3%7cServiceRequest%7c4%7cAdministration%7c5%7cEnvHealth%7c6%7cCurrentTabIndex%7c1";

async function getRecordId(recordNumber) {
  // important data here read bootstrap_data/README.md for more info
  // const cookie_string = fs
  //   .readFileSync(
  //     path.join(__dirname, "../bootstrap_data/cookies.txt"),
  //     "utf-8",
  //   )
  //   .trim(); //!important

  const html = fs.readFileSync(
    path.join(__dirname, "../bootstrap_data/raw_source_bootstrap.html"),
    "utf-8",
  ); //!important
  const BasePayload = buildBasicPayload(html); // builds the skeleton
  BasePayload["ctl00$PlaceHolderMain$txtEndDate"] = ""; // set enddate to zero
  const payload = recordIDPayloadBuilder(BasePayload, recordNumber);

  // require("fs").writeFileSync(
  //   "record.payload.json",
  //   JSON.stringify(payload, null, 2),
  // );

  const redirect = await postToServer(TARGET_URL, payload, cookie_string);

  const parsed = parseAccelaRedirect(redirect);
  console.log(parsed);
  return parsed?.recordId ?? null;
}
// const id = getRecordId("RES-NEW-26-003081").then((id) => console.log(id));

module.exports = getRecordId;

console.log(getRecordId("RES-CHG-26-007865"));
