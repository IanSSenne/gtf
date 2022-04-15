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
import { performance } from "perf_hooks";
const modPath = resolve(process.cwd(), "scripts", "modules");
if (!existsSync(modPath)) {
  mkdirSync(modPath, { recursive: true });
}
const patchedModules = [
  "mojang-minecraft",
  "mojang-minecraft-ui",
  "mojang-gametest",
];
const builtDependencies = new Map();
async function buildDependency(
  meta: esbuild.OnResolveArgs,
  minify: boolean
): Promise<esbuild.OnResolveResult> {
  if (patchedModules.includes(meta.path)) {
    return {
      path: meta.path,
      external: true,
    };
  }
  let resolvedPath = null;
  const start = performance.now();
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
  } catch (e) {
    console.log(e);
    process.exit();
  }
  await esbuild
    .build({
      entryPoints: [resolvedPath],
      bundle: true,
      minify,
      format: "esm",
      sourcemap: "external",
      outfile: resolve(process.cwd(), "scripts", "modules", meta.path + ".js"),
      external: ["mojang-minecraft", "mojang-gametest", "mojang-minecraft-ui"],
      plugins: [seperateDependencyPlugin(minify)],
    })
    .then((result) => {
      console.log(
        "built dependency",
        meta.path,
        "in",
        (performance.now() - start).toFixed(1) + "ms"
      );
    });
  return {
    path: "./modules/" + meta.path + ".js",
    external: true,
  };
}
let _buildCache = {};
function build2(path: string, p: () => Promise<any>) {
  if (_buildCache[path]) {
    return _buildCache[path];
  }
  _buildCache[path] = p();
  return _buildCache[path];
}
function seperateDependencyPlugin(production: boolean) {
  return {
    name: "seperate-dependencies",
    setup(build) {
      build.onResolve(
        {
          filter: /^@*[a-z]/,
        },
        async (args: esbuild.OnResolveArgs) => {
          if (builtDependencies.has(args.path)) {
            return builtDependencies.get(args.path);
          }
          return await build2(args.path, () =>
            buildDependency(args, production)
          );
        }
      );
    },
  };
}
export function getSharedBuildOptions(
  production: boolean
): esbuild.BuildOptions {
  return {
    plugins: [
      seperateDependencyPlugin(production),
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
