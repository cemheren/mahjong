import { randomFill } from "crypto";
import { Schema, ArraySchema, type } from "@colyseus/schema";
import { Tile } from "./tile";
import { MahjongState } from "./mahjongstate";
import { deepStrictEqual } from "assert";

export class Mahjong extends Schema{

    @type(MahjongState) state: MahjongState;
    @type([MahjongState]) history: ArraySchema<MahjongState> = new ArraySchema<MahjongState>();
    
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
        this.state = new MahjongState();
        this.state.tiles = array.map(value => new Tile(Math.floor(Math.random() * 34)));
        
        this.state.decks[0] = this.initDeck(0);
        this.state.decks[1] = this.initDeck(1);
        this.state.decks[2] = this.initDeck(2);
        this.state.decks[3] = this.initDeck(3);

        this.state.layedTiles[0] = [];
        this.state.layedTiles[1] = [];
        this.state.layedTiles[2] = [];
        this.state.layedTiles[3] = [];
    }
    
    saveHistory(){
        console.log("saveHistory()")
        if(this.history.length > 5){
            this.history.shift();
        }
        var copy = new MahjongState();
        copy.tiles = this.state.tiles;
        copy.decks[0] = this.state.decks[0].slice();
        copy.decks[1] = this.state.decks[1].slice();
        copy.decks[2] = this.state.decks[2].slice();
        copy.decks[3] = this.state.decks[3].slice();
        copy.draw = this.state.draw;
        copy.midTile = this.state.midTile;

        copy.layedTiles[0] = this.state.layedTiles[0].slice();
        copy.layedTiles[1] = this.state.layedTiles[1].slice();
        copy.layedTiles[2] = this.state.layedTiles[2].slice();
        copy.layedTiles[3] = this.state.layedTiles[3].slice();

        this.history.push(copy);
        console.log(`history length: ${this.history.length}`)
    }

    loadHistory(minus: number){
        console.log(`loadHistory(${minus})`)
        
        if(minus > 5 || this.history.length == 0){
            return false;
        }
        
        console.log(`history length: ${this.history.length}`)
        var originalLength = this.history.length;
        for (let i = 0; i < originalLength && i <= minus; i++) {
            var old = this.history.pop();     
            this.state = old;
        }

        return true;
    }

    setMidTile(tile: string){
        var y: number = +tile;
        this.state.midTile = y;
    }

    getDeck(at: number) : Tile[] {
        if (at == 0 || at == 1 || at == 2 || at == 3 ) {
            return this.state.decks[at];
        }
    }

    getLayedTiles(at: number) : Tile[][] {
        if (at == 0 || at == 1 || at == 2 || at == 3 ) {
            return this.state.layedTiles[at];
        }
    }

    setDeck(at: number, tiles: Tile[]) {
        if (at == 0 || at == 1 || at == 2 || at == 3 ) {
            this.state.decks[at] = tiles;
        }
    }

    removeItem(deck: Tile[], tile:number){
        deck = deck.filter(item => item.n !== tile);

        for(var i = deck.length - 1; i >= 0; i--) {
            if(deck[i].n == tile) {
                deck.splice(i, 1);
                break;
            }
        }

        return deck;
    }

    removeFromDeck(at: number, tile: number){
        this.saveHistory();
        var deck = this.getDeck(at);
        deck = this.removeItem(deck, tile);

        this.setDeck(at, deck);
        return deck;
    }

    removeFromDeck2(at: number, tiles: string[]){
        this.saveHistory();
        
        var deck = this.getDeck(at);
        for (let i = 0; i < tiles.length; i++) {
            const tile = +tiles[i];
            deck = this.removeItem(deck, tile);
        }

        this.setDeck(at, deck);
        return deck;
    }

    addToDeck(at: number, tile: number){
        //this.saveHistory();
        var deck = this.getDeck(at);

        deck.push(new Tile(tile));

        this.setDeck(at, deck);                
        return deck;
    }

    addToLayedTiles(at: number, tiles: string[]){
        //this.saveHistory();
        var layedTiles = this.getLayedTiles(at);
        layedTiles.push(tiles.map(function(v){ return new Tile(+v); }));
    }

    initDeck(at: number) : Tile[] {
        // each deck is 18 tiles. 
        // at should be 0 to 3.
        
        var current = this.state.tiles.slice(at * 18, (at+1) * 18);
        return current;
    }

    drawTile() : Tile {
        //this.saveHistory();
        var current = this.state.tiles[this.state.draw];
        this.state.draw++;

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