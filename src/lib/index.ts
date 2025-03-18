import * as fs from "node:fs";
import { REPLICATE_URL } from "./const.js";

export const streamAllChanges = async () => {
  fetch("https://replicate.npmjs.com/_changes").then(response => {
    const reader = response.body.getReader();
    return new ReadableStream({
      start(controller) {
        function push() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            controller.enqueue(value);
            push();
          });
        }
        push();
      }
    });
  })
    .then(stream => {
      // read the stream and write to std ourt
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      function read() {
        reader.read().then(({ done, value }) => {
          if (done) {
            console.log('Stream finished');
            return;
          }
          const text = decoder.decode(value);
          console.log(text);
          read();
        });
      }
      read();
    })
    .catch(error => {
      console.error('Error streaming data:', error);
    });
}

export const getAllPackageNames = async () => {

  console.log("Fetching all package names from npm registry...");
  let lastSequence = 0; // Start from the beginning

  async function getChanges(since: number) {
    const url = `${REPLICATE_URL}?since=${since}&limit=10000`; // Adjust limit as needed
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Fetched ${data.results.length} changes`);
    return data;
  }

  const output = []
  while (true) {
    const changes = await getChanges(lastSequence);
    if (!changes || !changes.results) {
      console.log('No more changes or error occurred.');
      break;
    }

    for (const change of changes.results) {
      // Process each change
      // console.log(`Processing change for package: ${change.id}, seq: ${change.seq}`);
      // Implement logic to add, update, or delete packages in your local storage
      // based on the change.
      output.push(change)

      lastSequence = change.seq; // Update the last sequence number
    }

    // Store the lastSequence number persistently (e.g., in a file or database)
    console.log(`Last sequence processed: ${lastSequence}`);

    // Add a delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
  }

  fs.writeFileSync('output.json', JSON.stringify(output, null, 2), 'utf8');

}
