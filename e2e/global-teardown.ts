// TC-40 (NFR-10), automated part: after the whole run, search the server's own output for the test
// landmark coordinates and for anything that looks like a request body. The landmark reaches the real
// server in api.spec.ts. The result is reported as a count only, never by copying the lines (test-plan §2.1 rule 7).
import { existsSync, readFileSync } from "node:fs";
import { SERVER_LOG } from "../playwright.config";

export default function globalTeardown() {
  if (!existsSync(SERVER_LOG)) {
    console.log("TC-40: no server log found (server not started by Playwright?) — not checked");
    return;
  }
  const lines = readFileSync(SERVER_LOG, "utf8").split("\n");
  // 3.158 / 3.1579… and 101.712 / 101.7116… (KLCC landmark), 90.0001 (an invalid body sent by TC-65), "lat"/"lon" keys.
  const leak = /3\.1579|3\.158|101\.7116|101\.712|90\.0001|"?\blat"?\s*:|"?\blon"?\s*:/;
  const hits = lines.filter((l) => leak.test(l)).length;
  console.log(`TC-40: server log has ${lines.length} lines; ${hits} contain a coordinate or request body`);
  if (hits > 0) throw new Error(`TC-40 failed: ${hits} server log line(s) contain coordinates (see ${SERVER_LOG})`);
}
