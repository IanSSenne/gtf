import { performance } from "perf_hooks";
import { CommandOptions } from "./CommandOptions";
import { default as createCommand } from "./sub/create";
import { default as buildCommand } from "./sub/build";
import { default as watchCommand } from "./sub/watch";
import chalk from "chalk";
function formatTime(ms: number) {
  if (ms < 1000) {
    return (Number.isInteger(ms) ? ms : ms.toFixed(2)) + "ms";
  }
  const units = [
    {
      unit: "d",
      value: 24 * 60 * 60 * 1000,
    },
    {
      unit: "h",
      value: 60 * 60 * 1000,
    },
    {
      unit: "m",
      value: 60 * 1000,
    },
    {
      unit: "s",
      value: 1000,
    },
  ];
  let result = "";
  for (const unit of units) {
    const value = Math.floor(ms / unit.value);
    if (value > 0) {
      result += value + unit.unit;
      ms -= value * unit.value;
    }
  }
  return result;
}
const commands = {
  create: createCommand,
  build: buildCommand,
  watch: watchCommand,
};
export async function runCommand<Command extends keyof CommandOptions>(
  target: Command,
  opts: CommandOptions[Command]
) {
  const start = performance.now();
  try {
    await commands[target](opts);
  } catch (e) {
    console.error(e);
    const end = performance.now();
    console.log(
      chalk.red(`command ${target} failed after ${formatTime(end - start)}`)
    );
  } finally {
    const end = performance.now();
    console.log(
      chalk.green(`command ${target} finished in ${formatTime(end - start)}`)
    );
  }
}
