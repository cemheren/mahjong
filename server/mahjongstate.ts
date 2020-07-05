import { randomFill } from "crypto";
import { Schema, MapSchema, type } from "@colyseus/schema";
import { Tile } from "./tile";
import { deepStrictEqual } from "assert";

export class MahjongState extends Schema{

    tiles: Tile[] = []; // the current tiles array
    decks: {
        0: Tile[],
        1: Tile[],
        2: Tile[],
        3: Tile[]
    } = {
        0: null,
        1: null,
        2: null,
        3: null,
    };
    @type("number") draw = 52; // start drawing at 72nd tile.
    @type("number") midTile: number;
    layedTiles:{
        0: Tile[][],
        1: Tile[][],
        2: Tile[][],
        3: Tile[][]
    } = {
        0: null,
        1: null,
        2: null,
        3: null,
    };
}