import { REPLICATE_URL } from "./const.js";
import fs from "node:fs";

export const getAllPackageNames = async ({
  limit,
  since,
}: { limit: number; since: number }): Promise<void> => {
  const packageLimit = Number(limit);
  const whenToStart = Number(since);

  console.log(
    `Fetching all package names from npm registry (limit ${packageLimit})`,
  );

  let lastSequence = 0; // Start from the beginning
  let lastFetchTime = 0;

  async function getChanges() {
    const url = `${REPLICATE_URL}?since=${whenToStart}&limit=${packageLimit}`; // Adjust limit as needed
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  const output = [];
  while (true) {
    lastFetchTime = Date.now();
    const changes = await getChanges();
    if (!changes || !changes.results) {
      console.log("No more changes or error occurred.");
      break;
    }

    for (const change of changes.results) {
      // Process each change
      // console.log(`Processing change for package: ${change.id}, seq: ${change.seq}`);
      // Implement logic to add, update, or delete packages in your local storage
      // based on the change.
      output.push(change);

      lastSequence = change.seq; // Update the last sequence number
    }

    // Store the lastSequence number persistently (e.g., in a file or database)
    const timeInSeconds = Math.floor((Date.now() - lastFetchTime) / 1000);
    console.log(
      `seq: ${lastSequence}, total packages: ${output.length}, time: ${timeInSeconds} seconds`,
    );

    // Add a delay to avoid overwhelming the API
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
  }

  fs.writeFileSync("output.json", JSON.stringify(output, null, 2), "utf8");
};
