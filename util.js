// internal/util/PlayerProxy.js
import { BlockRaycastOptions, EntityRaycastOptions } from "mojang-minecraft";

// internal/util/EntityDataStore.js
var EntityDataStore = class {
  constructor(entity) {
    this.entity = entity;
    this.raw = this.entity.getDynamicProperty("_");
  }
};

// internal/util/PlayerProxy.js
var FeatureFlags;
(function(FeatureFlags2) {
  FeatureFlags2[FeatureFlags2["NONE"] = 0] = "NONE";
  FeatureFlags2[FeatureFlags2["NAME"] = 1] = "NAME";
})(FeatureFlags || (FeatureFlags = {}));
var PlayerProxy = class {
  constructor(player) {
    this._ = player;
    this.rotation = player.rotation;
    this.scoreboard = player.scoreboard;
  }
  runCommandAsync(commandString) {
    throw new Error("Method not implemented.");
  }
  setRotation(degreesX, degreesY) {
    this.rotation.x = degreesX;
    this.rotation.y = degreesY;
  }
  cache(key, value) {
    if (this.c.has(key))
      return this.c.get(key);
    let v = value();
    this.c.set(key, v);
    return v;
  }
  get targetPlayer() {
    return this._;
  }
  get bodyRotation() {
    return this._.rotation.x;
  }
  get dimension() {
    return this._.dimension;
  }
  get headLocation() {
    return this._.headLocation;
  }
  get id() {
    return this._.id;
  }
  get isSneaking() {
    return this._.isSneaking;
  }
  set isSneaking(value) {
    this._.isSneaking = value;
  }
  get location() {
    return this._.location;
  }
  get name() {
    return this._.name;
  }
  get nameTag() {
    return this._.nameTag;
  }
  set nameTag(value) {
    this._.nameTag = value;
  }
  get onScreenDisplay() {
    return this._.onScreenDisplay;
  }
  get selectedSlot() {
    return this._.selectedSlot;
  }
  get inventory() {
    return this.getComponent("minecraft:inventory");
  }
  get selectedItem() {
    const inventory = this.inventory;
    try {
      return inventory ? inventory.container.getItem(this.selectedSlot) : null;
    } catch (e) {
      return null;
    }
  }
  set selectedItem(item) {
    const inventory = this.inventory;
    if (inventory) {
      inventory.container.setItem(this.selectedSlot, item);
    }
  }
  set selectedSlot(value) {
    this._.selectedSlot = value;
  }
  get target() {
    return this._.target;
  }
  set target(value) {
    this._.target = value;
  }
  get velocity() {
    return this._.velocity;
  }
  get viewVector() {
    return this._.viewVector;
  }
  store() {
    return this.cache("store", () => new EntityDataStore(this._));
  }
  addEffect(effectType, duration, amplifier, showParticles) {
    this._.addEffect(effectType, duration, amplifier, showParticles);
  }
  addTag(tag) {
    return this._.addTag(tag);
  }
  getBlockFromViewVector(options) {
    let _opts;
    if (options) {
      _opts = new BlockRaycastOptions();
      Object.assign(_opts, options);
    }
    return this._.getBlockFromViewVector(_opts);
  }
  getComponent(componentId) {
    return this.cache("Component;" + componentId, () => this.getComponent(componentId));
  }
  getComponents() {
    return this._.getComponents();
  }
  getDynamicProperty(identifier) {
    return this._.getDynamicProperty(identifier);
  }
  getEffect(effectType) {
    return this._.getEffect(effectType);
  }
  getEntitiesFromViewVector(options) {
    let _opts;
    if (options) {
      _opts = new EntityRaycastOptions();
      Object.assign(_opts, options);
    }
    return this._.getEntitiesFromViewVector(_opts);
  }
  getItemCooldown(itemCategory) {
    return this._.getItemCooldown(itemCategory);
  }
  getTags() {
    return this._.getTags();
  }
  hasComponent(componentId) {
    return this._.hasComponent(componentId);
  }
  hasTag(tag) {
    return this._.hasTag(tag);
  }
  kill() {
    this._.kill();
  }
  playSound(soundID, soundOptions) {
    return this._.playSound(soundID, soundOptions);
  }
  removeDynamicProperty(identifier) {
    return this._.removeDynamicProperty(identifier);
  }
  removeTag(tag) {
    return this._.removeTag(tag);
  }
  runCommand(commandString) {
    return this._.runCommand(commandString);
  }
  setDynamicProperty(identifier, value) {
    this._.setDynamicProperty(identifier, value);
  }
  setVelocity(velocity) {
    this._.setVelocity(velocity);
  }
  startItemCooldown(itemCategory, tickDuration) {
    this._.startItemCooldown(itemCategory, tickDuration);
  }
  teleport(location, dimension, xRotation, yRotation) {
    this._.teleport(location, dimension, xRotation, yRotation);
  }
  teleportFacing(location, dimension, facingLocation) {
    this._.teleportFacing(location, dimension, facingLocation);
  }
  triggerEvent(eventName) {
    this._.triggerEvent(eventName);
  }
};

// internal/util/registerEvents.js
import { world } from "mojang-minecraft";
function registerEvents(events) {
  for (const [key, value] of Object.entries(events)) {
    world.events[key].subscribe(value);
  }
}
export {
  PlayerProxy,
  registerEvents
};
