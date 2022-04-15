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
import * as cp from "child_process";
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
const builtDependencies = new Map();
async function buildDependency(
  meta: esbuild.OnResolveArgs
): Promise<esbuild.OnResolveResult> {
  if (patchedModules.includes(meta.path)) {
    return {
      path: meta.path,
      external: true,
    };
  }
  let resolvedPath = null;
  try {
    resolvedPath = cp
      .execSync(
        `node --print "try{require('${meta.path}')}catch(e){};require.resolve('${meta.path}')"`,
        {
          cwd: process.cwd(),
        }
      )
      .toString("utf-8")
      .trim();
    console.log(resolvedPath.toString());
  } catch (e) {
    console.log(e);
    process.exit();
  }
  await esbuild
    .build({
      entryPoints: [resolvedPath],
      bundle: true,
      minify: true,
      format: "esm",
      sourcemap: "external",
      outfile: resolve(process.cwd(), "scripts", "modules", meta.path + ".js"),
      external: ["mojang-minecraft", "mojang-gametest", "mojang-minecraft-ui"],
      plugins: [seperateDependencyPlugin()],
    })
    .then((result) => {
      console.log("built dependency", meta.path);
    });
  return {
    path: "./modules/" + meta.path + ".js",
    external: true,
  };
}
function seperateDependencyPlugin() {
  return {
    name: "seperate-dependencies",
    setup(build) {
      build.onResolve(
        {
          filter: /^@*[a-z]/,
        },
        async (args: esbuild.OnResolveArgs) => {
          console.log(args);
          if (builtDependencies.has(args.path)) {
            return builtDependencies.get(args.path);
          }
          return await buildDependency(args);
        }
      );
    },
  };
}
export function getSharedBuildOptions(): esbuild.BuildOptions {
  return {
    plugins: [
      seperateDependencyPlugin(),
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
