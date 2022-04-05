import { program } from "commander";
import { runCommand } from "./runCommand";

program
  .command("build")
  .option("--config <path>", "path to config file")
  .action(async (options) => {
    console.log(options);
    runCommand("build", {
      config: options,
    });
  });
program
  .command("watch")
  .option("--config <path>", "path to config file")
  .action(async (options) => {
    runCommand("watch", { config: options });
  });
program.command("create").action(async () => {
  runCommand("create", {});
});
program.parse(process.argv);
