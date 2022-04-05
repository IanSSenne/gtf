import {
  BlockLocation,
  ChatEvent,
  Dimension,
  Player,
  world,
} from "mojang-minecraft";
type discard = never;
type AppendArgument<Base, Next> = Base extends (
  ctx: infer X,
  ...args: infer E
) => infer R
  ? (ctx: X, ...args: [...E, Next]) => R
  : never;
export type ArgumentResult<T> =
  | {
      success: true;
      value: T;
      raw: string;
      push?: boolean;
    }
  | {
      success: false;
      error: string;
      depth?: number;
    };
type GuessTypeBasedOnArgumentResultType<T extends ArgumentResult<any>> =
  T extends { value: infer U }
    ? U extends { success: false }
      ? discard
      : U
    : discard;
export type CommandResult =
  | {
      success: true;
      executionSuccess: boolean;
      executionError?: any;
    }
  | {
      success: false;
      error: string;
      depth?: number;
    };
/**
 * @class ArgumentMatcher
 * @description Template class for checking if a string matches a certain pattern.
 */
export class ArgumentMatcher {
  name!: string;
  /**
   *
   * @param _value the value to match against
   * @returns
   */
  matches(_value: string, _context: CommandContext): ArgumentResult<any> {
    return {
      success: false,
      error: "NOT IMPLEMENTED",
    };
  }
  /**
   * DO NOT USE, INTERNAL METHOD
   * @param name
   * @returns
   * @private
   */
  setName(name: string): this {
    this.name = name;
    return this;
  }
}
class RootArgumentMatcher {
  name!: string;
  matches(_value: string): ArgumentResult<any> {
    return {
      success: true,
      value: "",
      raw: "",
      push: false,
    };
  }
  setName(name: string): this {
    this.name = name;
    return this;
  }
}
class LiteralArgumentMatcher extends ArgumentMatcher {
  constructor(private readonly literal: string) {
    super();
  }
  matches(value: string): ArgumentResult<null> {
    return value === this.literal || value.startsWith(this.literal + " ")
      ? {
          success: true,
          value: null,
          raw: this.literal,
          push: false,
        }
      : {
          success: false,
          error: `Expected '${this.literal}'`,
        };
  }
}
export class StringArgumentMatcher extends ArgumentMatcher {
  constructor() {
    super();
  }
  matches(value: string): ArgumentResult<string> {
    return {
      success: true,
      value,
      raw: value,
      push: true,
    };
  }
}
export class NumberArgumentMatcher extends ArgumentMatcher {
  constructor() {
    super();
  }
  matches(value: string): ArgumentResult<number> {
    try {
      const match = value.match(/^(-*(?:\d(?:\.\d+)*|(?:\.\d+)))/);
      if (match) {
        const value2 = parseFloat(match[0]);
        if (Number.isNaN(value2) && Array.isArray(match)) {
          return {
            success: false,
            error: `Expected a number for '${this.name}'`,
          };
        } else {
          return {
            success: true,
            value: value2,
            raw: match[0],
            push: true,
          };
        }
      }
      return {
        success: false,
        error: `Expected a number for '${this.name}'`,
      };
    } catch (e) {
      return {
        success: false,
        error: `Expected a number for '${this.name}'`,
      };
    }
  }
}
class SelectorArgumentMatcher extends ArgumentMatcher {
  constructor() {
    super();
  }
}
class ArgumentBuilder<
  HandlerFn extends Function = (ctx: CommandContext) => void
> {
  actions: ArgumentBuilder[];
  depth = 0;
  executable?: HandlerFn;
  constructor(
    public readonly matcher: ArgumentMatcher = new RootArgumentMatcher()
  ) {
    this.actions = [];
  }
  private bind<T extends ArgumentBuilder<any>>(ab: T): T {
    this.actions.push(ab);
    ab.setDepth(this.depth + 1);
    return ab;
  }
  private setDepth(depth: number) {
    this.depth = depth;
    this.actions.forEach((a) => a.setDepth(depth + 1));
  }

  /**
   *
   * @param target
   * @private
   */
  __add(target: ArgumentBuilder<any>): void {
    this.actions.push(target);
    target.setDepth(this.depth + 1);
  }
  /**
   *
   * @param target
   * @private
   */
  __redirect(target: ArgumentBuilder<any>): void {
    this.actions.push(...target.actions);
  }
  /**
   * @example
   * ```
   * ArgumentBuilderInstance.literal("hello").literal("world")
   * ```
   * @param value the literal value to match against
   * @returns
   */
  literal(value: string): ArgumentBuilder<HandlerFn> {
    return this.bind(
      new ArgumentBuilder<HandlerFn>(
        new LiteralArgumentMatcher(value).setName(value)
      )
    );
  }
  /**
   * @example
   * ```
   * ArgumentBuilderInstance.literal("roll").number("count")
   * ```
   * this would match `roll 14` and provide `14` as the count
   *
   * @param name
   * @returns
   */
  number(name: string): ArgumentBuilder<AppendArgument<HandlerFn, number>> {
    return this.bind(
      new ArgumentBuilder<AppendArgument<HandlerFn, number>>(
        new NumberArgumentMatcher().setName(name)
      )
    );
  }

  /**
   * @example
   * ```
   * ArgumentBuilderInstance.literal("roll").string("pattern")
   * ```
   * this would match `roll 1d20` and provide `1d20` as the pattern
   *
   * @param name
   * @returns
   */
  string(name: string): ArgumentBuilder<AppendArgument<HandlerFn, string>> {
    return this.bind(
      new ArgumentBuilder<AppendArgument<HandlerFn, string>>(
        new StringArgumentMatcher().setName(name)
      )
    );
  }
  /**
   * @example
   * ```
   * ArgumentBuilderInstance.literal("roll").selector("pattern")
   * ```
   * this would match `roll 1d20` and provide `1d20` as the pattern
   *
   * @param name
   * @returns
   */
  selector(name: string): ArgumentBuilder<AppendArgument<HandlerFn, string>> {
    return this.bind(
      new ArgumentBuilder<AppendArgument<HandlerFn, string>>(
        new SelectorArgumentMatcher().setName(name)
      )
    );
  }
  /**
   * @example
   * ```
   * ArgumentBuilderInstance.literal("roll").argument("count",new NumberArgumentMatcher())
   * ```
   * this would match `roll 14` and provide `14` as the count as a number
   *
   * @param name
   * @param matcher
   * @returns
   **/
  argument<ArgumentType extends ArgumentMatcher>(
    name: string,
    matcher: ArgumentType
  ): ArgumentBuilder<
    AppendArgument<
      HandlerFn,
      GuessTypeBasedOnArgumentResultType<ReturnType<ArgumentType["matches"]>>
    >
  > {
    return this.bind(
      new ArgumentBuilder<
        AppendArgument<
          HandlerFn,
          GuessTypeBasedOnArgumentResultType<
            ReturnType<ArgumentType["matches"]>
          >
        >
      >(matcher.setName(name))
    );
  }
  /**
   * @example
   * ```
   * ArgumentBuilderInstance.literal("roll").number("count").executes((ctx:CommandContext,count:number)=>{
   * 	console.warn(`the count is ${count}`);
   * })
   * ```
   * tells the command parser that the particular path is executable and privide a function to execute.
   * @param handler
   * @returns
   **/
  executes(callback: HandlerFn) {
    this.bind(new ArgumentBuilder<HandlerFn>()).executable = callback;
    return this;
  }
  /**
   * @example
   * ```
   * ArgumentBuilderInstance.evaluate(ctx,"roll 1d20")
   * ```
   * this would evaluate the command and return the result
   * @param ctx
   * @param command
   * @returns
   **/
  evaluate(
    ctx: CommandContext,
    command: string,
    args: any[] = []
  ): CommandResult {
    if (command.length === 0) {
      if (this.executable) {
        try {
          this.executable(ctx, ...args);
        } catch (e: any) {
          return {
            success: true,
            executionSuccess: false,
            executionError: e,
          };
        }
        return { success: true, executionSuccess: true };
      } else {
        return {
          success: false,
          error: "Unexpected end of command",
        };
      }
    }
    let result = this.matcher.matches(command.trim(), ctx);
    if (result.success === true) {
      let results = [];
      for (const action of this.actions) {
        const result2 = action.evaluate(
          ctx,
          command.trim().substring(result.raw.length),
          result.push ? [...args, result.value] : [...args]
        );
        if (result2.success) return result2;
        results.push(result2);
      }
      const min = Math.min(...results.map((r) => r.depth || Infinity));
      return results.find((r) => r.depth === min) as CommandResult;
    } else {
      return {
        success: false,
        error: result.error,
        depth: this.depth,
      };
    }
  }
}
export const commandRoot = new ArgumentBuilder();
export const helpMessages = new Map<string, string>();
export function registerCommand(
  command: ArgumentBuilder,
  help: string,
  alias: string[] = []
) {
  alias.forEach((a) => {
    helpMessages.set(a, help);
    commandRoot.literal(a).__redirect(command);
  });
  commandRoot.__add(command);
  helpMessages.set(command.matcher.name, help);
}
export function literal(value: string): ArgumentBuilder {
  return new ArgumentBuilder(new LiteralArgumentMatcher(value));
}
export interface CommandContext {
  event: ChatEvent;
  sender: Player;
  dimension: Dimension;
}
const OVERWORLD = world.getDimension("overworld");
const THE_NETHER = world.getDimension("nether");
const THE_END = world.getDimension("the end");
function getDimension(player: Player) {
  const bl = new BlockLocation(
    Math.floor(player.location.x),
    Math.floor(player.location.y),
    Math.floor(player.location.z)
  );
  if (OVERWORLD.getEntitiesAtBlockLocation(bl).includes(player))
    return OVERWORLD;
  if (THE_NETHER.getEntitiesAtBlockLocation(bl).includes(player))
    return THE_NETHER;
  if (THE_END.getEntitiesAtBlockLocation(bl).includes(player)) return THE_END;
  throw new Error("Unable to locate player dimension");
}
world.events.beforeChat.subscribe((event) => {
  if (event.message.startsWith("-")) {
    const command = event.message.substring(1);
    const result = commandRoot.evaluate(
      {
        event,
        sender: event.sender,
        dimension: getDimension(event.sender),
      },
      command
    );
    event.cancel = true;
    if (result.success === false) {
      console.warn(result.error);
    }
  }
});
