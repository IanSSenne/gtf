import { buildBarrelFile } from "../buildBarrelFile";
import path from "path";
import { CommandOptions } from "../CommandOptions";
import chokidar from "chokidar";
import esbuild from "esbuild";
import chalk from "chalk";
import { getSharedBuildOptions } from "../getSharedBuildOptions";
export default async function execute(opts: CommandOptions["watch"]) {
  const project_directory = path.resolve(process.cwd(), "src");
  const watcher = chokidar.watch(project_directory);
  let doneInitializing = false;
  function rebuildProject(file?: string) {
    if (!doneInitializing) return;
    if (file)
      console.log(
        path.relative(project_directory, file) + " changed, rebuilding!"
      );
    else console.log("Building Project.");
    const entrypoint = buildBarrelFile();
    esbuild
      .build({
        entryPoints: [entrypoint],
        outfile: path.resolve(process.cwd(), "scripts", "pack.js"),
        bundle: true,
        minify: false,
        format: "esm",
        sourcemap: "external",
        external: [
          "mojang-minecraft",
          "mojang-gametest",
          "mojang-minecraft-ui",
        ],
        ...getSharedBuildOptions(),
      })
      .then((result) => {
        if (result.errors.length) {
          console.log(
            esbuild
              .formatMessagesSync(result.errors, {
                kind: "error",
              })
              .join("\n")
          );
        } else if (result.warnings.length) {
          console.log(
            esbuild
              .formatMessagesSync(result.warnings, {
                kind: "warning",
              })
              .join("\n")
          );
        } else {
          console.log(chalk.green("build succesfull!"));
        }
      });
  }
  watcher.on("change", rebuildProject);
  watcher.on("add", rebuildProject);
  watcher.on("unlink", rebuildProject);
  watcher.on("ready", () => {
    doneInitializing = true;
    rebuildProject();
  });
  await new Promise(() => {});
}
