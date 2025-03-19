import { load, sync } from "all-package-names";
import fs from "node:fs";

const start = performance.now();
sync().then(({ packageNames }) => {
  fs.writeFileSync(
    "output.json",
    JSON.stringify(packageNames, null, 2),
    "utf8",
  );

  console.log(
    `Fetched ${packageNames.length} package names in ${(
      performance.now() - start
    ).toFixed(2)}ms`,
  );
});
