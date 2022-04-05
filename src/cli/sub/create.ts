import { CommandOptions } from "../CommandOptions";
import prompts from "prompts";
import { mkdir, readdir, writeFile } from "fs/promises";
import chalk from "chalk";
import { randomUUID } from "crypto";
import { resolve } from "path";
import { execSync } from "child_process";
class File {
  constructor(public contents: string) {}
}
function error(message: string) {
  console.log(chalk.red(message));
  throw new Error(message);
}
type OFs = Record<string, OFs | File>;
async function SyncFs(base: string, ofs: OFs) {
  if (ofs instanceof File) {
    await writeFile(base, ofs.contents);
  } else {
    for (const [name, contents] of Object.entries(base)) {
      const path = resolve(base, name);
      await mkdir(path, { recursive: true });
      await SyncFs(path, contents);
    }
  }
}
export default async function execute(opts: CommandOptions["create"]) {
  const answers = await prompts([
    {
      type: "text",
      message: "What do you want to name your pack?",
      name: "name",
    },
    {
      type: "multiselect",
      name: "libraries",
      message:
        "Which libraries do you want to include?\n mojang-minecraft will be included automaticly",
      choices: [
        { title: "mojang-gametest", value: "mojang-gametest" },
        {
          title: "mojang-minecraft-ui",
          value: "mojang-minecraft-ui",
        },
      ],
      hint: "- Space to select. Return to submit",
    },
  ]);
  const folder = await readdir(process.cwd());
  if (folder.includes(answers.name))
    error(`The folder already include a directory '${name}'`);
  const pack_uuid = randomUUID();
  const module_uuid = randomUUID();
  const modules = {
    "mojang-minecraft-ui": "2bd50a27-ab5f-4f40-a596-3641627c635e",
    "mojang-gametest": "6f4b6893-1bb6-42fd-b458-7fa3d0c89616",
  };
  const fs = {
    [answers.name]: {
      "manifest.json": new File(
        JSON.stringify(
          {
            format_version: 2,
            header: {
              description: `made with gtf`,
              name,
              uuid: pack_uuid,
              version: [0, 0, 1],
              min_engine_version: [1, 14, 0],
            },
            modules: [
              {
                description: "Gametest Module",
                type: "javascript",
                uuid: module_uuid,
                version: [0, 0, 1],
                entry: "scripts/pack.js",
              },
            ],
            dependencies: [
              {
                // mojang-minecraft
                uuid: "b26a4d4c-afdf-4690-88f8-931846312678",
                version: [0, 1, 0],
              },
              ...answers.libraries.map((library) => ({
                uuid: modules[library],
                version: [0, 1, 0],
              })),
            ],
          },
          null,
          2
        )
      ),
      "package.json": new File(
        JSON.stringify(
          {
            name: answers.name,
            version: "0.0.1",
            license: "MIT",
            scripts: {
              dev: "gtf watch",
              build: "gtf build",
            },
          },
          null,
          2
        )
      ),
      src: {
        commands: {
          "ping.ts": new File(`import { literal } from "gtf/command";
export const definition = literal("ping")
  .executes((ctx) => {
    ctx.sender.runCommand("say pong");
  })
export const help = "Ping Pong";
`),
        },
      },
    },
  };
  await SyncFs(process.cwd(), fs);
  const cwd = resolve(process.cwd(), answers.name);
  execSync("npm add @types/mojang-minecraft --dev", { cwd: cwd });
  execSync("npm add IanSSenne/gtf --dev");
}
