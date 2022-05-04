const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");
function getAllFiles(dir) {
  let files = [];
  let dirs = [];
  let list = fs.readdirSync(dir);
  list.forEach(function (file) {
    let filePath = path.join(dir, file);
    let stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      dirs.push(filePath);
    } else {
      files.push(filePath);
    }
  });
  dirs.forEach(function (dir) {
    files = files.concat(getAllFiles(dir));
  });
  return files;
}
if (!process.argv.includes("dev"))
  esbuild
    .build({
      entryPoints: ["./command.js"],
      bundle: true,
      external: ["mojang-minecraft", "mojang-gametest", "mojang-minecraft-ui"],
      outfile: "command.js",
      format: "esm",
      platform: "node",
      minify: false,
      allowOverwrite: true,
    })
    .then(() => {
      esbuild
        .build({
          entryPoints: ["./util.js"],
          bundle: true,
          external: [
            "mojang-minecraft",
            "mojang-gametest",
            "mojang-minecraft-ui",
          ],
          outfile: "util.js",
          format: "esm",
          platform: "node",
          minify: false,
          allowOverwrite: true,
        })
        .then(() => {
          getAllFiles("./internal")
            .filter((_) => _.endsWith(".js"))
            .forEach((file) => {
              fs.unlinkSync(file);
            });
        });
    });
