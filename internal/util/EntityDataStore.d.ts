import { Entity } from "mojang-minecraft";
export declare class EntityDataStore<X extends object> {
    private entity;
    raw: string;
    data: Partial<X>;
    constructor(entity: Entity);
    get(): Promise<Partial<X>>;
    update(data: Partial<X>): Promise<void>;
    delete(key: string): Promise<void>;
}
