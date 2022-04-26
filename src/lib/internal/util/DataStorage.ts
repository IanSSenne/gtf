import {
  BlockInventoryComponent,
  BlockLocation,
  ItemStack,
  MinecraftBlockTypes,
  MinecraftItemTypes,
  world,
} from "mojang-minecraft";
const RNG = new (class SeededRNG {
  private seed: number = GTF.env.GTF_PACK_ID;
  get(max: number): number {
    this.seed = (this.seed * 0x5deece66d + 0xb) & 0xffffffff;
    return this.seed % max;
  }
})();
const INDEX_LOCATION = new BlockLocation(0xefffff, 0, 0xefffff);
let _index: BlockInventoryComponent;
const DIM = world.getDimension("overworld");
function setChestAt(location: BlockLocation) {
  let block = DIM.getBlock(location);
  if (block.id !== "minecraft:chest") {
    DIM.runCommand(
      `fill ${location.x - 1} ${location.y + 1} ${location.z - 1} ${
        location.x + 1
      } ${location.y + 1} ${location.z + 1} minecraft:barrier 0 replace`
    );
    block.setType(MinecraftBlockTypes.chest);
  }
  return DIM.getBlock(location);
}
let block = DIM.getBlock(INDEX_LOCATION);
if (block.id !== "minecraft:chest") block = setChestAt(INDEX_LOCATION);
_index = block.getComponent("minecraft:inventory") as BlockInventoryComponent;
const indexItem = _index.container.getItem(0);
const MAX_ENTERY_SIZE = 0x7ff0;
function _seperateData(data: string) {
  const size: number = Math.floor(data.length / MAX_ENTERY_SIZE);
  if (size > MAX_ENTERY_SIZE) {
    throw new Error("Data too large");
  }
  const result: string[] = [];
  for (let i = 0; i < size; i++) {
    result.push(data.substr(i * MAX_ENTERY_SIZE, MAX_ENTERY_SIZE));
  }
  return result;
}
function _updateIndex(value: any) {
  const string = JSON.stringify(value);
  let item =
    _index.container.getItem(0) || new ItemStack(MinecraftItemTypes.dirt, 1, 0);
  item.setLore(_seperateData(string));
  _index.container.setItem(0, item);
}
function _readData(item: ItemStack) {
  return JSON.parse(item.getLore().join(""));
}
if (!indexItem) {
  _updateIndex({});
}
let temp = _lookupIndex(GTF.env.GTF_PACK_ID);
let store_location = new BlockLocation(temp.x, 0, temp.z);
const myBlock = setChestAt(store_location);
const myContainer = myBlock.getComponent(
  "minecraft:inventory"
) as BlockInventoryComponent;
const item =
  myContainer.container.getItem(0) ||
  new ItemStack(MinecraftItemTypes.dirt, 1, 0);
myContainer.container.setItem(0, item);
function _lookupIndex(key: string) {
  let item = _index.container.getItem(0);
  let data: any;
  if (item) {
    data = _readData(item);
    if (key in data) return data[key];
  } else {
    item = new ItemStack(MinecraftItemTypes.dirt, 1, 0);
    data = {};
  }
  let _value: { x: number; z: number };
  _updateIndex({
    ...data,
    [key]: (_value = {
      x: INDEX_LOCATION.x + RNG.get(0xffff),
      z: INDEX_LOCATION.z + RNG.get(0xffff),
    }),
  });
  return _value;
}

let data = _readData(item);
let F_can_sync = true;
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
export const WorldStorage = new (class {
  get(key: string) {
    return data[key];
  }
  set(key: string, value: any) {
    let result = (data[key] = value);
    _sync();
    return result;
  }
  delete(key: string) {
    let result = delete data[key];
    _sync();
    return result;
  }
})();
