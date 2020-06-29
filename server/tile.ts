import { Schema, type } from "@colyseus/schema";

export class Tile extends Schema{
    @type("number") n: number;

    constructor(n: number) {
        super();
        // 34 * 4 = 136 tiles no seasons. 
        this.n = n;
    }
}