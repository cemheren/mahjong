import { randomFill } from "crypto";
import { Schema, MapSchema, type } from "@colyseus/schema";
import { Tile } from "./tile";

export class Mahjong extends Schema{

    tiles: Tile[] = []; // the current tiles array

    @type("number") draw = 72; // start drawing at 72nd tile.

    constructor() {
        super();
        // 34 * 4 = 136 tiles no seasons. 
        var array: number[] = [];

        for (let i = 0; i < 136; i = i + 4) {
            array.push(i);  
            array.push(i);  
            array.push(i);  
            array.push(i);  
        }

        array = this.shuffle(array);

        this.tiles = array.map(value => new Tile(Math.floor(Math.random() * 34)));
    }
    
    getDeck(at: number) : Tile[] {
        // each deck is 18 tiles. 
        // at should be 0 to 3.
        
        var current = this.tiles.slice(at * 18, (at+1) * 18);
        return current;
    }

    drawTile() : Tile {
        var current = this.tiles[this.draw];
        this.draw++;

        return current;
    }

    shuffle(array: number[]) {
        var currentIndex = array.length, temporaryValue, randomIndex;
      
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
      
          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
      
        return array;
      }
}