import { Command } from "commander";
import { getAllPackageNames } from "./get-all-package-names.js";

const program = new Command();
program.name("getem");

// create all-packages command
program
  .command("all-packages")
  .option("-l, --limit [limit]", "The amount of items to fetch", "500")
  .option("-s, --since [size]", "When to start from", "0")
  .option("-d, --debug", "When to start from", false)
  .description("Get all package names")
  .action(getAllPackageNames);

program.parse(process.argv);
