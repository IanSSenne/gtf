import { Entity } from "mojang-minecraft";
// import { compress as bCompress, decompress as bDecompress } from "fflate";
// import { promisify } from "util";
// const compress = promisify(bCompress);
// const decompress = promisify(bDecompress);
// function toU8(str: string) {
//   let u8a = new Uint8Array(str.length);
//   for (let i = 0; i < str.length; i++) {
//     u8a[i] = str.charCodeAt(i);
//   }
//   return u8a;
// }
export class EntityDataStore<X extends object> {
  raw: string;
  data: Partial<X>;
  constructor(private entity: Entity) {
    this.raw = this.entity.getDynamicProperty("_") as string;
  }
  //   get(): Promise<Partial<X>> {
  //     if (this.data) return Promise.resolve(this.data);
  //     return decompress(toU8(this.raw)).then((data) => {
  //       this.data = JSON.parse(String.fromCharCode(...data));
  //       return this.data;
  //     });
  //   }
  //   update(data: Partial<X>): Promise<void> {
  //     Object.assign(this.data, data);
  //     return compress(toU8(JSON.stringify(data))).then((data) => {
  //       this.raw = data.toString();
  //       this.entity.setDynamicProperty("_", this.raw);
  //     });
  //   }
  //   delete(key: string): Promise<void> {
  //     delete this.data[key];
  //     return this.update(this.data);
  //   }
}
