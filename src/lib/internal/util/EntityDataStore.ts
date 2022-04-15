import { Entity } from "mojang-minecraft";
import { brotliCompress, brotliDecompress } from "zlib";
import { promisify } from "util";
const compress = promisify(brotliCompress);
const decompress = promisify(brotliDecompress);
export class EntityDataStore<X extends object> {
  raw: string;
  data: Partial<X>;
  constructor(private entity: Entity) {
    this.raw = this.entity.getDynamicProperty("_") as string;
  }
  get(): Promise<Partial<X>> {
    if (this.data) return Promise.resolve(this.data);
    return decompress(
      new Uint8Array([...this.raw].map((c) => c.charCodeAt(0)))
    ).then((data) => {
      this.data = JSON.parse(data.toString());
      return this.data;
    });
  }
  update(data: Partial<X>): Promise<void> {
    Object.assign(this.data, data);
    return compress(JSON.stringify(data)).then((data) => {
      this.raw = data.toString();
      this.entity.setDynamicProperty("_", this.raw);
    });
  }
  delete(key: string): Promise<void> {
    delete this.data[key];
    return this.update(this.data);
  }
}
