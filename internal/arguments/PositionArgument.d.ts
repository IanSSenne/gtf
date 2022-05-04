import { ArgumentMatcher, ArgumentResult, CommandContext } from "../ArgumentMatcher";
import { Location } from "mojang-minecraft";
export declare class PositionArgumentMatcher extends ArgumentMatcher {
    matches(_value: string, context: CommandContext): ArgumentResult<Location>;
}
