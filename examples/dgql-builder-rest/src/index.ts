import { driver } from "./dgql";
import * as app from "./app";

async function main() {
  await driver.verifyConnectivity();
  await app.start();
}

main();
