import { Events } from "mojang-minecraft";
export declare type FirstArgumentType<Fn extends (x: any) => void> = Fn extends (x: infer A) => void ? A : never;
export declare type EventGroup = {
    [Key in keyof Events]?: (event: FirstArgumentType<FirstArgumentType<Events[Key]["subscribe"]>>) => void;
};
declare function registerEvents(events: EventGroup): void;
export { registerEvents };
