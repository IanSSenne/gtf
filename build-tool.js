const esbuild = require("esbuild");
esbuild.build({
  entryPoints: ["./src/cli/main.ts"],
  bundle: true,
  minify: false,
  external: ["esbuild"],
  outfile: "bin/gtf.js",
  format: "cjs",
  platform: "node",
  watch: process.argv.includes("dev"),
  banner: {
    js: "#!/usr/bin/env node",
  },
  treeShaking: true,
});
