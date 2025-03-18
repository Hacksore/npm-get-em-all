import { Command } from "commander";
import { getAllPackageNames } from "./get-all-package-names.js";

const program = new Command();
program.name("getem");

// create all-packages command
program
  .command("all-packages")
  .option("-l, --limit", "The amount of items to fetch", "500")
  .description("Get all package names")
  .action(getAllPackageNames);

program.parse(process.argv);
