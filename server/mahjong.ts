import { randomFill } from "crypto";
import { Schema, MapSchema, type } from "@colyseus/schema";
import { Tile } from "./tile";
import { deepStrictEqual } from "assert";

export class Mahjong extends Schema{

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
        
        this.decks[0] = this.initDeck(0);
        this.decks[1] = this.initDeck(1);
        this.decks[2] = this.initDeck(2);
        this.decks[3] = this.initDeck(3);
    }
    
    getDeck(at: number) : Tile[] {
        if (at == 0 || at == 1 || at == 2 || at == 3 ) {
            return this.decks[at];
        }
    }

    setDeck(at: number, tiles: Tile[]) {
        if (at == 0 || at == 1 || at == 2 || at == 3 ) {
            this.decks[at] = tiles;
        }
    }

    removeFromDeck(at: number, tile: number){
        var deck = this.getDeck(at);
        deck = deck.filter(item => item.n !== tile);

        for(var i = deck.length - 1; i >= 0; i--) {
            if(deck[i].n == tile) {
                deck.splice(i, 1);
                break;
            }
        }

        this.setDeck(at, deck);

        return deck;
    }

    addToDeck(at: number, tile: number){
        var deck = this.getDeck(at);

        deck.push(new Tile(tile));

        this.setDeck(at, deck);        

        return deck;
    }

    initDeck(at: number) : Tile[] {
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