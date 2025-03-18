export const streamAllChanges = async () => {
  fetch("https://replicate.npmjs.com/_changes")
    .then((response) => {
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
        },
      });
    })
    .then((stream) => {
      // read the stream and write to std ourt
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      function read() {
        reader.read().then(({ done, value }) => {
          if (done) {
            console.log("Stream finished");
            return;
          }
          const text = decoder.decode(value);
          console.log(text);
          read();
        });
      }
      read();
    })
    .catch((error) => {
      console.error("Error streaming data:", error);
    });
};
