import { ChatEvent, Dimension, Player } from "mojang-minecraft";
export interface CommandContext {
  event: ChatEvent;
  sender: Player;
  dimension: Dimension;
}
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
