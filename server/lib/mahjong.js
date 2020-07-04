"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mahjong = void 0;
const schema_1 = require("@colyseus/schema");
const tile_1 = require("./tile");
class Mahjong extends schema_1.Schema {
    constructor() {
        super();
        // 34 * 4 = 136 tiles no seasons. 
        var array = [];
        for (let i = 0; i < 136; i = i + 4) {
            array.push(i);
            array.push(i);
            array.push(i);
            array.push(i);
        }
        array = this.shuffle(array);
        this.state.tiles = array.map(value => new tile_1.Tile(Math.floor(Math.random() * 34)));
        this.state.decks[0] = this.initDeck(0);
        this.state.decks[1] = this.initDeck(1);
        this.state.decks[2] = this.initDeck(2);
        this.state.decks[3] = this.initDeck(3);
    }
    saveHistory() {
        if (this.history.length > 5) {
            this.history.shift();
        }
        this.history.push(this.state);
    }
    loadHistory(minus) {
        if (minus > 5 || this.history.length < minus) {
            Error("history can't go back more than 5");
        }
        for (let i = 0; i < 5; i++) {
            this.state = this.history.pop();
        }
    }
    getDeck(at) {
        if (at == 0 || at == 1 || at == 2 || at == 3) {
            return this.state.decks[at];
        }
    }
    setDeck(at, tiles) {
        if (at == 0 || at == 1 || at == 2 || at == 3) {
            this.state.decks[at] = tiles;
        }
    }
    removeFromDeck(at, tile) {
        var deck = this.getDeck(at);
        deck = deck.filter(item => item.n !== tile);
        for (var i = deck.length - 1; i >= 0; i--) {
            if (deck[i].n == tile) {
                deck.splice(i, 1);
                break;
            }
        }
        this.setDeck(at, deck);
        this.saveHistory();
        return deck;
    }
    addToDeck(at, tile) {
        var deck = this.getDeck(at);
        deck.push(new tile_1.Tile(tile));
        this.setDeck(at, deck);
        this.saveHistory();
        return deck;
    }
    initDeck(at) {
        // each deck is 18 tiles. 
        // at should be 0 to 3.
        var current = this.state.tiles.slice(at * 18, (at + 1) * 18);
        return current;
    }
    drawTile() {
        var current = this.state.tiles[this.state.draw];
        this.state.draw++;
        this.saveHistory();
        return current;
    }
    shuffle(array) {
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
exports.Mahjong = Mahjong;
