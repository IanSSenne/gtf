import path from "path";
import { CommandOptions } from "../CommandOptions";
import esbuild from "esbuild";
import { buildBarrelFile } from "../buildBarrelFile";
export default async function execute(opts: CommandOptions["build"]) {
  console.log({ opts });
  const entrypoint = buildBarrelFile();
  esbuild.build({
    entryPoints: [entrypoint],
    outfile: path.resolve(process.cwd(), "scripts", "pack.js"),
    bundle: true,
    minify: true,
    format: "esm",
    sourcemap: "external",
    external: ["mojang-minecraft", "mojang-gametest", "mojang-minecraft-ui"],
  });
}
