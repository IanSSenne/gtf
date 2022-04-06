import esbuild from "esbuild";
import {
  existsSync,
  fstat,
  mkdirSync,
  readdirSync,
  unlinkSync,
  write,
  writeFileSync,
} from "fs";
import { resolve, sep } from "path";
const modPath = resolve(process.cwd(), "scripts", "modules");
if (!existsSync(modPath)) {
  mkdirSync(modPath, { recursive: true });
}
const patchedModules = [
  "mojang-minecraft",
  "mojang-minecraft-ui",
  "mojang-gametest",
];
const written = new Set();
let lastPatchedModules = new Set(
  readdirSync(modPath).map((f) => f.replace(/\.js$/, ""))
);
export function getSharedBuildOptions(): esbuild.BuildOptions {
  return {
    plugins: [
      //   {
      //     name: "dedupe imports",
      //     setup(build) {
      //       console.log("setup");
      //       const requiredThisBuild = new Set<string>();
      //       build.onResolve(
      //         {
      //           filter: /^mojang-[a-z-]+$/,
      //         },
      //         function (args): esbuild.OnResolveResult {
      //           requiredThisBuild.add(args.path);
      //           console.log(args.importer);
      //           //   return {
      //           //     path: resolve(modPath, args.path + ".js"),
      //           //   };
      //           return {
      //             // contents: `export * from "${args.path}"`,
      //             external: true,
      //             path: "./modules/" + args.path + ".js",
      //             // path: resolve(modPath, args.path) + ".js",
      //           };
      //         }
      //       );
      //       build.onEnd((result) => {
      //         for (const next of requiredThisBuild) {
      //           if (!lastPatchedModules.has(next))
      //             console.log(`created dependency for ${next}`);
      //           writeFileSync(
      //             resolve(modPath, next) + ".js",
      //             `export * from "${next}"`
      //           );
      //           writeFileSync(
      //             resolve(modPath, next) + ".d.ts",
      //             `export * from "${next}"`
      //           );
      //         }
      //         for (const last of lastPatchedModules) {
      //           if (!requiredThisBuild.has(last)) {
      //             console.log(`removed dependency for ${last}`);
      //             try {
      //               unlinkSync(resolve(modPath, last) + ".js");
      //             } catch (e) {}
      //             try {
      //               unlinkSync(resolve(modPath, last) + ".d.ts");
      //             } catch (e) {}
      //           }
      //         }
      //         lastPatchedModules = requiredThisBuild;
      //       });
      //     },
      //   },
    ],
  };
}
