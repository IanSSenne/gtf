import { Events, world } from "mojang-minecraft";
export type FirstArgumentType<Fn extends (x: any) => void> = Fn extends (
  x: infer A
) => void
  ? A
  : never;
export type EventGroup = {
  [Key in keyof Events]?: (
    event: FirstArgumentType<FirstArgumentType<Events[Key]["subscribe"]>>
  ) => void;
};
function registerEvents(events: EventGroup) {
  for (const [key, value] of Object.entries(events)) {
    world.events[key].subscribe(value);
  }
}
export { registerEvents };
