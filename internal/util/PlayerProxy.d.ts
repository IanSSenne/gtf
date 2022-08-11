import { Block, BlockRaycastOptions, CommandResult, Dimension, Effect, EffectType, Entity, EntityInventoryComponent, EntityRaycastOptions, IEntityComponent, ItemStack, Location, Player, ScoreboardIdentity, ScreenDisplay, SoundOptions, Vector, XYRotation } from "mojang-minecraft";
import { EntityDataStore } from "./EntityDataStore";
export declare enum FeatureFlags {
    NONE = 0,
    NAME = 1
}
export declare class PlayerProxy implements Player {
    private _;
    private c;
    rotation: XYRotation;
    scoreboard: ScoreboardIdentity;
    protected constructor(player: Player);
    runCommandAsync(commandString: string): Promise<CommandResult>;
    setRotation(degreesX: number, degreesY: number): void;
    private cache;
    get targetPlayer(): Player;
    /**
     * @deprecated
     */
    get bodyRotation(): number;
    get dimension(): Dimension;
    get headLocation(): Location;
    get id(): string;
    get isSneaking(): boolean;
    set isSneaking(value: boolean);
    get location(): Location;
    get name(): string;
    get nameTag(): string;
    set nameTag(value: string);
    get onScreenDisplay(): ScreenDisplay;
    get selectedSlot(): number;
    get inventory(): EntityInventoryComponent;
    get selectedItem(): ItemStack | null;
    set selectedItem(item: ItemStack);
    set selectedSlot(value: number);
    get target(): Entity;
    set target(value: Entity);
    get velocity(): Vector;
    get viewVector(): Vector;
    store<X extends object>(): EntityDataStore<X>;
    addEffect(effectType: EffectType, duration: number, amplifier?: number, showParticles?: boolean): void;
    addTag(tag: string): boolean;
    getBlockFromViewVector(options?: Partial<BlockRaycastOptions>): Block;
    getComponent(componentId: string): IEntityComponent;
    getComponents(): IEntityComponent[];
    getDynamicProperty(identifier: string): string | number | boolean;
    getEffect(effectType: EffectType): Effect;
    getEntitiesFromViewVector(options?: Partial<EntityRaycastOptions>): Entity[];
    getItemCooldown(itemCategory: string): number;
    getTags(): string[];
    hasComponent(componentId: string): boolean;
    hasTag(tag: string): boolean;
    kill(): void;
    playSound(soundID: string, soundOptions?: SoundOptions): void;
    removeDynamicProperty(identifier: string): boolean;
    removeTag(tag: string): boolean;
    runCommand(commandString: string): any;
    setDynamicProperty(identifier: string, value: string | number | boolean): void;
    setVelocity(velocity: Vector): void;
    startItemCooldown(itemCategory: string, tickDuration: number): void;
    teleport(location: Location, dimension: Dimension, xRotation: number, yRotation: number): void;
    teleportFacing(location: Location, dimension: Dimension, facingLocation: Location): void;
    triggerEvent(eventName: string): void;
}
