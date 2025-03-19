import { REPLICATE_URL } from "./const.js";
import fs from "node:fs";

export interface GetAllPackageOptions {
  limit: number;
  since: number;
  debug: boolean;
}

export const getAllPackageNames = async ({
  limit,
  since,
  debug,
}: GetAllPackageOptions): Promise<void> => {
  const packageLimit = Number(limit);
  const whenToStart = Number(since);

  console.log(
    `Fetching all package names from npm registry (limit ${packageLimit})`,
  );
  console.log(`Starting from ${since})`);

  let lastSequence = 0;
  let lastFetchTime = 0;

  // TODO: give this a typescript type
  async function getChanges() {
    const url = `${REPLICATE_URL}?since=${whenToStart}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Error fetching data: ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (debug) {
      console.log(JSON.stringify(data));
    }

    return data;
  }

  const allPackages = [];
  while (true) {
    lastFetchTime = Date.now();
    const changes = await getChanges();
    if (!changes || !changes.results) {
      console.log("No more changes or error occurred.");
      break;
    }

    for (const change of changes.results) {
      allPackages.push(change);

      lastSequence = change.seq;
    }

    const timeInMillisecondsOrSeconds = () => {
      const timeInSeconds = (Date.now() - lastFetchTime) / 1000;
      return timeInSeconds > 1
        ? timeInSeconds
        : (timeInSeconds * 1000).toFixed(2);
    };

    console.log(
      `seq: ${lastSequence}, total packages: ${allPackages.length}, time: ${timeInMillisecondsOrSeconds()} seconds`,
    );

    // TODO: investigate what the rate limit is and if we can speed this up at all?
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  fs.writeFileSync("output.json", JSON.stringify(allPackages, null, 2), "utf8");
};
