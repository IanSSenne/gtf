import {
  BlockLocation as _,
  ItemStack as u,
  MinecraftBlockTypes as y,
  MinecraftItemTypes as f,
  world as p,
} from "mojang-minecraft";
var o = new _(15728639, 0, 15728639),
  a,
  m = p.getDimension("overworld"),
  c = m.getBlock(o);
c.id !== "minecraft:chest" &&
  (m.runCommand(
    `fill ${o.x - 1} ${o.y + 1} ${o.z - 1} ${o.x + 1} ${o.y + 1} ${
      o.z + 1
    } minecraft:barrier 0 replace`
  ),
  c.setType(y.chest));
a = c.getComponent("minecraft:inventory");
var d = a.container.getItem(0);
d || a.container.setItem(0, new u(f.dirt, 1, 0));
var h = new (class {
  get(r) {}
  set(r) {}
  delete(r) {}
})();
import {
  BlockRaycastOptions as v,
  EntityRaycastOptions as w,
} from "mojang-minecraft";
var i = class {
  constructor(t) {
    (this.entity = t), (this.raw = this.entity.getDynamicProperty("_"));
  }
};
var l;
(function (r) {
  (r[(r.NONE = 0)] = "NONE"), (r[(r.NAME = 1)] = "NAME");
})(l || (l = {}));
var g = class {
  constructor(t) {
    this._ = t;
  }
  cache(t, e) {
    if (this.c.has(t)) return this.c.get(t);
    let n = e();
    return this.c.set(t, n), n;
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
  set isSneaking(t) {
    this._.isSneaking = t;
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
  set nameTag(t) {
    this._.nameTag = t;
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
    let t = this.inventory;
    try {
      return t ? t.container.getItem(this.selectedSlot) : null;
    } catch {
      return null;
    }
  }
  set selectedItem(t) {
    let e = this.inventory;
    e && e.container.setItem(this.selectedSlot, t);
  }
  set selectedSlot(t) {
    this._.selectedSlot = t;
  }
  get target() {
    return this._.target;
  }
  set target(t) {
    this._.target = t;
  }
  get velocity() {
    return this._.velocity;
  }
  get viewVector() {
    return this._.viewVector;
  }
  store() {
    return this.cache("store", () => new i(this._));
  }
  addEffect(t, e, n, s) {
    this._.addEffect(t, e, n, s);
  }
  addTag(t) {
    return this._.addTag(t);
  }
  getBlockFromViewVector(t) {
    let e;
    return (
      t && ((e = new v()), Object.assign(e, t)),
      this._.getBlockFromViewVector(e)
    );
  }
  getComponent(t) {
    return this.cache("Component;" + t, () => this.getComponent(t));
  }
  getComponents() {
    return this._.getComponents();
  }
  getDynamicProperty(t) {
    return this._.getDynamicProperty(t);
  }
  getEffect(t) {
    return this._.getEffect(t);
  }
  getEntitiesFromViewVector(t) {
    let e;
    return (
      t && ((e = new w()), Object.assign(e, t)),
      this._.getEntitiesFromViewVector(e)
    );
  }
  getItemCooldown(t) {
    return this._.getItemCooldown(t);
  }
  getTags() {
    return this._.getTags();
  }
  hasComponent(t) {
    return this._.hasComponent(t);
  }
  hasTag(t) {
    return this._.hasTag(t);
  }
  kill() {
    this._.kill();
  }
  playSound(t, e) {
    return this._.playSound(t, e);
  }
  removeDynamicProperty(t) {
    return this._.removeDynamicProperty(t);
  }
  removeTag(t) {
    return this._.removeTag(t);
  }
  runCommand(t) {
    return this._.runCommand(t);
  }
  setDynamicProperty(t, e) {
    this._.setDynamicProperty(t, e);
  }
  setVelocity(t) {
    this._.setVelocity(t);
  }
  startItemCooldown(t, e) {
    this._.startItemCooldown(t, e);
  }
  teleport(t, e, n, s) {
    this._.teleport(t, e, n, s);
  }
  teleportFacing(t, e, n) {
    this._.teleportFacing(t, e, n);
  }
  triggerEvent(t) {
    this._.triggerEvent(t);
  }
};
import { world as C } from "mojang-minecraft";
function S(r) {
  for (let [t, e] of Object.entries(r)) C.events[t].subscribe(e);
}
console.log(h);
export { g as PlayerProxy, h as WorldStorage, S as registerEvents };
