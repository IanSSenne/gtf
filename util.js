// internal/util/DataStorage.js
import { BlockLocation, ItemStack, MinecraftBlockTypes, MinecraftItemTypes, world } from "mojang-minecraft";
var RNG = new class SeededRNG {
  constructor() {
    this.seed = GTF.env.GTF_PROJECT_ID;
  }
  get(max) {
    this.seed = this.seed * 25214903917 + 11 & 4294967295;
    return this.seed % max;
  }
}();
var INDEX_LOCATION = new BlockLocation(15728639, 0, 15728639);
var _index;
var DIM = world.getDimension("overworld");
function setChestAt(location) {
  let block2 = DIM.getBlock(location);
  if (block2.id !== "minecraft:chest") {
    DIM.runCommand(`fill ${location.x - 1} ${location.y + 1} ${location.z - 1} ${location.x + 1} ${location.y + 1} ${location.z + 1} minecraft:barrier 0 replace`);
    block2.setType(MinecraftBlockTypes.chest);
  }
  return DIM.getBlock(location);
}
var block = DIM.getBlock(INDEX_LOCATION);
if (block.id !== "minecraft:chest")
  block = setChestAt(INDEX_LOCATION);
_index = block.getComponent("minecraft:inventory");
var indexItem = _index.container.getItem(0);
var MAX_ENTERY_SIZE = 32752;
function _seperateData(data2) {
  const size = Math.floor(data2.length / MAX_ENTERY_SIZE);
  if (size > MAX_ENTERY_SIZE) {
    throw new Error("Data too large");
  }
  const result = [];
  for (let i = 0; i < size; i++) {
    result.push(data2.substr(i * MAX_ENTERY_SIZE, MAX_ENTERY_SIZE));
  }
  return result;
}
function _updateIndex(value) {
  const string = JSON.stringify(value);
  let item2 = _index.container.getItem(0) || new ItemStack(MinecraftItemTypes.dirt, 1, 0);
  item2.setLore(_seperateData(string));
  _index.container.setItem(0, item2);
}
function _readData(item2) {
  return JSON.parse(item2.getLore().join(""));
}
if (!indexItem) {
  _updateIndex({});
}
var temp = _lookupIndex(GTF.env.GTF_PROJECT_ID);
var store_location = new BlockLocation(temp.x, 0, temp.z);
var myBlock = setChestAt(store_location);
var myContainer = myBlock.getComponent("minecraft:inventory");
var item = myContainer.container.getItem(0) || new ItemStack(MinecraftItemTypes.dirt, 1, 0);
myContainer.container.setItem(0, item);
function _lookupIndex(key) {
  let item2 = _index.container.getItem(0);
  let data2;
  if (item2) {
    data2 = _readData(item2);
    if (key in data2)
      return data2[key];
  } else {
    item2 = new ItemStack(MinecraftItemTypes.dirt, 1, 0);
    data2 = {};
  }
  let _value;
  _updateIndex({
    ...data2,
    [key]: _value = {
      x: INDEX_LOCATION.x + RNG.get(65535),
      z: INDEX_LOCATION.z + RNG.get(65535)
    }
  });
  return _value;
}
var data = _readData(item);
var F_can_sync = true;
function _sync() {
  if (F_can_sync) {
    F_can_sync = false;
    const callback = world.events.tick.subscribe(() => {
      F_can_sync = true;
      const start = Date.now();
      item.setLore(_seperateData(JSON.stringify(data)));
      myContainer.container.setItem(0, item);
      world.events.tick.unsubscribe(callback);
      console.log(`[GTF] Synced data in ${Date.now() - start}ms`);
    });
  }
}
var WorldStorage = new class {
  get(key) {
    return data[key];
  }
  set(key, value) {
    let result = data[key] = value;
    _sync();
    return result;
  }
  delete(key) {
    let result = delete data[key];
    _sync();
    return result;
  }
}();

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
    return this._.bodyRotation;
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
  set selectedItem(item2) {
    const inventory = this.inventory;
    if (inventory) {
      inventory.container.setItem(this.selectedSlot, item2);
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
import { world as world2 } from "mojang-minecraft";
function registerEvents(events) {
  for (const [key, value] of Object.entries(events)) {
    world2.events[key].subscribe(value);
  }
}

// internal/util.js
console.log(WorldStorage);
export {
  PlayerProxy,
  WorldStorage,
  registerEvents
};
