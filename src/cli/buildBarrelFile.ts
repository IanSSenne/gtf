import { existsSync, mkdirSync, readdirSync, writeFileSync } from "fs";
import path from "path";

export function buildBarrelFile() {
  const baseDirectory = path.resolve(process.cwd(), "src", "commands");
  let barrel = `import {registerCommand} from "gtf/command";\nimport {registerEvents} from "gtf/util";\n`;
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
		registerCommand(command$${i}.definition.root,command$${i}.help,command$${i}.alias);
		if(command$${i}.events)
			registerEvents(command$${i}.events);
	  }`;
    });
  if (
    existsSync(path.resolve(process.cwd(), "src", "main.ts")) ||
    existsSync(path.resolve(process.cwd(), "src", "main.js"))
  ) {
    barrel += `import ${JSON.stringify(
      path.resolve(
        process.cwd(),
        "src",
        existsSync(path.resolve(process.cwd(), "src", "main.ts"))
          ? "main.ts"
          : "main.js"
      )
    )};`;
  }
  const dir = path.resolve(process.cwd(), ".gtf_cache", "barrel");
  mkdirSync(dir, { recursive: true });
  const file = path.resolve(dir, "commands.ts");
  writeFileSync(file, barrel);
  return file;
}
