import { mkdirSync, readdirSync, writeFileSync } from "fs";
import path from "path";

export function buildBarrelFile() {
  const baseDirectory = path.resolve(process.cwd(), "src", "commands");
  let barrel = `import {registerCommand} from "gtf/command";\n`;
  readdirSync(baseDirectory)
    .filter(
      (file) =>
        file.endsWith(".ts") ||
        file.endsWith(".js") ||
        file.endsWith(".tsx") ||
        file.endsWith(".jsx")
    )
    .forEach((file, i) => {
      barrel += `import * as command$${i} from ${JSON.stringify(
        path
          .resolve(process.cwd(), "src", "commands", file)
          .replace(/\.[tj]sx?$/, "")
      )};
	  if(command$${i}.condition??true){
		registerCommand(command$${i}.definition,command$${i}.help,command$${i}.alias);
	  }`;
    });
  const dir = path.resolve(process.cwd(), ".gtf_cache", "barrel");
  mkdirSync(dir, { recursive: true });
  const file = path.resolve(dir, "commands.ts");
  writeFileSync(file, barrel);
  return file;
}
