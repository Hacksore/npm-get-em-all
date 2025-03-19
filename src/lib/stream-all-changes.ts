const response = await fetch("https://replicate.npmjs.com/_changes");
const reader = response.body.getReader();

const appendToFile = async (str: string) => {
  const fs = await import("node:fs/promises");
  const filePath = "./all-package-names.txt";
  await fs.appendFile(filePath, str, "utf8");
}

// read the stream and write to std ourt
const decoder = new TextDecoder();
function read() {
  reader.read().then(({ done, value }) => {
    if (done) {
      console.log("Stream finished");
      return;
    }
    const text = decoder.decode(value);
    appendToFile(text);
    read();
  }).catch((error) => {
    console.error("Error reading stream:", error);
  })
}

read();

export {}
