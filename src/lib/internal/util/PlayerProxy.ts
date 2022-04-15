import {
  Block,
  BlockRaycastOptions,
  Dimension,
  Effect,
  EffectType,
  Entity,
  EntityInventoryComponent,
  EntityRaycastOptions,
  IEntityComponent,
  ItemStack,
  Location,
  Player,
  ScreenDisplay,
  SoundOptions,
  Vector,
} from "mojang-minecraft";
import { EntityDataStore } from "./EntityDataStore";
export enum FeatureFlags {
  NONE = 0,
  NAME,
}
export class PlayerProxy implements Player {
  private _: Player;
  private c: Map<string, any>;
  protected constructor(player: Player) {
    this._ = player;
  }
  private cache<T>(key: string, value: () => T): T {
    if (this.c.has(key)) return this.c.get(key);
    let v = value();
    this.c.set(key, v);
    return v;
  }
  get targetPlayer(): Player {
    return this._;
  }
  get bodyRotation(): number {
    return this._.bodyRotation;
  }
  get dimension(): Dimension {
    return this._.dimension;
  }
  get headLocation(): Location {
    return this._.headLocation;
  }
  get id(): string {
    return this._.id;
  }
  get isSneaking(): boolean {
    return this._.isSneaking;
  }
  set isSneaking(value: boolean) {
    this._.isSneaking = value;
  }
  get location(): Location {
    return this._.location;
  }
  get name(): string {
    return this._.name;
  }
  get nameTag(): string {
    return this._.nameTag;
  }
  set nameTag(value: string) {
    this._.nameTag = value;
  }
  get onScreenDisplay(): ScreenDisplay {
    return this._.onScreenDisplay;
  }
  get selectedSlot(): number {
    return this._.selectedSlot;
  }
  get inventory(): EntityInventoryComponent {
    return this.getComponent("minecraft:inventory") as EntityInventoryComponent;
  }
  get selectedItem(): ItemStack | null {
    const inventory = this.inventory;
    try {
      return inventory ? inventory.container.getItem(this.selectedSlot) : null;
    } catch (e) {
      return null;
    }
  }
  set selectedItem(item: ItemStack) {
    const inventory = this.inventory;
    if (inventory) {
      inventory.container.setItem(this.selectedSlot, item);
    }
  }
  set selectedSlot(value: number) {
    this._.selectedSlot = value;
  }
  get target(): Entity {
    return this._.target;
  }
  set target(value: Entity) {
    this._.target = value;
  }
  get velocity(): Vector {
    return this._.velocity;
  }
  get viewVector(): Vector {
    return this._.viewVector;
  }
  store<X extends object>(): EntityDataStore<X> {
    return this.cache("store", () => new EntityDataStore(this._));
  }
  addEffect(
    effectType: EffectType,
    duration: number,
    amplifier?: number,
    showParticles?: boolean
  ): void {
    this._.addEffect(effectType, duration, amplifier, showParticles);
  }
  addTag(tag: string): boolean {
    return this._.addTag(tag);
  }
  getBlockFromViewVector(options?: Partial<BlockRaycastOptions>): Block {
    let _opts: BlockRaycastOptions;
    if (options) {
      _opts = new BlockRaycastOptions();
      Object.assign(_opts, options);
    }
    return this._.getBlockFromViewVector(_opts);
  }
  getComponent(componentId: string): IEntityComponent {
    return this.cache("Component;" + componentId, () =>
      this.getComponent(componentId)
    );
  }
  getComponents(): IEntityComponent[] {
    return this._.getComponents();
  }
  getDynamicProperty(identifier: string): string | number | boolean {
    return this._.getDynamicProperty(identifier);
  }
  getEffect(effectType: EffectType): Effect {
    return this._.getEffect(effectType);
  }
  getEntitiesFromViewVector(options?: Partial<EntityRaycastOptions>): Entity[] {
    let _opts: EntityRaycastOptions;
    if (options) {
      _opts = new EntityRaycastOptions();
      Object.assign(_opts, options);
    }
    return this._.getEntitiesFromViewVector(_opts);
  }
  getItemCooldown(itemCategory: string): number {
    return this._.getItemCooldown(itemCategory);
  }
  getTags(): string[] {
    return this._.getTags();
  }
  hasComponent(componentId: string): boolean {
    return this._.hasComponent(componentId);
  }
  hasTag(tag: string): boolean {
    return this._.hasTag(tag);
  }
  kill(): void {
    this._.kill();
  }
  playSound(soundID: string, soundOptions?: SoundOptions): void {
    return this._.playSound(soundID, soundOptions);
  }
  removeDynamicProperty(identifier: string): boolean {
    return this._.removeDynamicProperty(identifier);
  }
  removeTag(tag: string): boolean {
    return this._.removeTag(tag);
  }
  runCommand(commandString: string) {
    return this._.runCommand(commandString);
  }
  setDynamicProperty(
    identifier: string,
    value: string | number | boolean
  ): void {
    this._.setDynamicProperty(identifier, value);
  }
  setVelocity(velocity: Vector): void {
    this._.setVelocity(velocity);
  }
  startItemCooldown(itemCategory: string, tickDuration: number): void {
    this._.startItemCooldown(itemCategory, tickDuration);
  }
  teleport(
    location: Location,
    dimension: Dimension,
    xRotation: number,
    yRotation: number
  ): void {
    this._.teleport(location, dimension, xRotation, yRotation);
  }
  teleportFacing(
    location: Location,
    dimension: Dimension,
    facingLocation: Location
  ): void {
    this._.teleportFacing(location, dimension, facingLocation);
  }
  triggerEvent(eventName: string): void {
    this._.triggerEvent(eventName);
  }
}
