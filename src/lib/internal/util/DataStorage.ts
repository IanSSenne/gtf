import {
  BlockInventoryComponent,
  BlockLocation,
  ItemStack,
  MinecraftBlockTypes,
  MinecraftItemTypes,
  world,
} from "mojang-minecraft";

const INDEX_LOCATION = new BlockLocation(0xefffff, 0, 0xefffff);
let _index: BlockInventoryComponent;
const DIM = world.getDimension("overworld");
let block = DIM.getBlock(INDEX_LOCATION);
if (block.id !== "minecraft:chest") {
  DIM.runCommand(
    `fill ${INDEX_LOCATION.x - 1} ${INDEX_LOCATION.y + 1} ${
      INDEX_LOCATION.z - 1
    } ${INDEX_LOCATION.x + 1} ${INDEX_LOCATION.y + 1} ${
      INDEX_LOCATION.z + 1
    } minecraft:barrier 0 replace`
  );
  block.setType(MinecraftBlockTypes.chest);
}
_index = block.getComponent("minecraft:inventory") as BlockInventoryComponent;
const indexItem = _index.container.getItem(0);
if (!indexItem) {
  _index.container.setItem(0, new ItemStack(MinecraftItemTypes.dirt, 1, 0));
}
export const WorldStorage = new (class {
  get(key: string) {}
  set(key: string) {}
  delete(key: string) {}
})();
