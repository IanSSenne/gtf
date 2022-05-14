import { Location } from "mojang-minecraft";
import { ArgumentMatcher, ArgumentResult, CommandContext } from "./ArgumentMatcher";
declare type discard = never;
declare type AppendArgument<Base, Next> = Base extends (ctx: infer X, ...args: infer E) => infer R ? (ctx: X, ...args: [...E, Next]) => R : never;
declare type GuessTypeBasedOnArgumentResultType<T extends ArgumentResult<any>> = T extends {
    value: infer U;
} ? U extends {
    success: false;
} ? discard : U : discard;
export declare type CommandResult = {
    success: true;
    executionSuccess: boolean;
    executionError?: any;
} | {
    success: false;
    error: string;
    depth?: number;
};
export declare class StringArgumentMatcher extends ArgumentMatcher {
    constructor();
    matches(value: string): ArgumentResult<string>;
}
export declare class NumberArgumentMatcher extends ArgumentMatcher {
    constructor();
    matches(value: string): ArgumentResult<number>;
}
declare class ArgumentBuilder<HandlerFn extends Function = (ctx: CommandContext) => void> {
    readonly matcher: ArgumentMatcher;
    actions: ArgumentBuilder[];
    depth: number;
    executable?: HandlerFn;
    parent: ArgumentBuilder;
    constructor(matcher?: ArgumentMatcher);
    private bind;
    private setDepth;
    get root(): ArgumentBuilder<any>;
    /**
     *
     * @param target
     * @private
     */
    __add(target: ArgumentBuilder<any>): void;
    /**
     *
     * @param target
     * @private
     */
    __redirect(target: ArgumentBuilder<any>): void;
    /**
     * @example
     * ```
     * ArgumentBuilderInstance.literal("hello").literal("world")
     * ```
     * @param value the literal value to match against
     * @returns
     */
    literal(value: string): ArgumentBuilder<HandlerFn>;
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
    number(name: string): ArgumentBuilder<AppendArgument<HandlerFn, number>>;
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
    string(name: string): ArgumentBuilder<AppendArgument<HandlerFn, string>>;
    /**
     * @example
     * ```
     * ArgumentBuilderInstance.literal("setblock").position("pattern")
     * ```
     * this would match `roll 1 1 1` and provide `Location{x:1,y:1,z:1}` as the pattern
     * also supports `~` for relative to the source position
     * and `^` for local coordinates
     *
     * @param name
     * @returns
     */
    position(name: string): ArgumentBuilder<AppendArgument<HandlerFn, Location>>;
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
    selector(name: string): ArgumentBuilder<AppendArgument<HandlerFn, string>>;
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
    argument<ArgumentType extends ArgumentMatcher>(name: string, matcher: ArgumentType): ArgumentBuilder<AppendArgument<HandlerFn, GuessTypeBasedOnArgumentResultType<ReturnType<ArgumentType["matches"]>>>>;
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
    executes(callback: HandlerFn): ArgumentBuilder<HandlerFn>;
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
    evaluate(ctx: CommandContext, command: string, args?: any[]): CommandResult;
}
export declare const commandRoot: ArgumentBuilder<(ctx: CommandContext) => void>;
export declare const helpMessages: Map<string, string>;
export declare function registerCommand(command: ArgumentBuilder, help: string, alias?: string[]): void;
export declare function literal(value: string): ArgumentBuilder;
export {};
