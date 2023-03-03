import {
  green,
  cyan,
  red,
  yellow,
  bold,
} from "https://deno.land/std@0.178.0/fmt/colors.ts";
import { format } from "https://deno.land/std@0.178.0/datetime/mod.ts";

export class Logger {
  constructor(readonly module: string) {}

  get base() {
    return bold(`[${this.module}]`);
  }

  log(message: string, ...contents: unknown[]) {
    console.log(green(this.base), green(message), ...contents);
  }

  warn(message: string, ...contents: unknown[]) {
    console.warn(yellow(this.base), yellow(message), ...contents);
  }

  error(message: string, ...contents: unknown[]) {
    console.error(red(this.base), red(message), ...contents);
  }
}
