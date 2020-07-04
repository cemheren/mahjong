"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyRoom = exports.State = exports.Player = void 0;
const colyseus_1 = require("colyseus");
const schema_1 = require("@colyseus/schema");
const mahjong_1 = require("./mahjong");
const tile_1 = require("./tile");
class Player extends schema_1.Schema {
    constructor(deck, seat) {
        super();
        this.deck = new schema_1.ArraySchema(...deck);
        this.seat = seat;
    }
}
__decorate([
    schema_1.type([tile_1.Tile])
], Player.prototype, "deck", void 0);
__decorate([
    schema_1.type("number")
], Player.prototype, "seat", void 0);
exports.Player = Player;
class State extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.players = new schema_1.MapSchema();
        this.seats = new schema_1.MapSchema();
        this.mahjong = new mahjong_1.Mahjong();
    }
}
__decorate([
    schema_1.type("string")
], State.prototype, "currentTurn", void 0);
__decorate([
    schema_1.type({ map: Player })
], State.prototype, "players", void 0);
__decorate([
    schema_1.type({ map: Player })
], State.prototype, "seats", void 0);
__decorate([
    schema_1.type(mahjong_1.Mahjong)
], State.prototype, "mahjong", void 0);
__decorate([
    schema_1.type(Player)
], State.prototype, "turn", void 0);
exports.State = State;
class MyRoom extends colyseus_1.Room {
    onCreate(options) {
        this.setState(new State());
        this.onMessage("chat", (client, message) => {
            this.broadcast("chat-receive", message.text);
        });
        this.onMessage("pullTile", (client, data) => {
            var p1 = this.state.players[client.sessionId];
            var tile = this.state.mahjong.drawTile();
            this.broadcast("chat-receive", `Player ${p1.seat} has pulled a ${tile.n}`);
            var deck = this.state.mahjong.addToDeck(p1.seat, tile.n);
            // change to custom command.
            client.send("pullTile-receive", { tile: tile.n });
        });
        this.onMessage("revertTo", (client, data) => {
            var p1 = this.state.players[client.sessionId];
            this.state.mahjong.loadHistory(data);
        });
        this.onMessage("throwTile", (client, data) => {
            var p1 = this.state.players[client.sessionId];
            this.broadcast("chat-receive", `Player ${p1.seat} has thrown a ${data.tile}`);
            var deck = this.state.mahjong.removeFromDeck(p1.seat, data.tile);
            // change to custom command.
            // client.send("init", {deck: deck});
        });
    }
    onJoin(client, options) {
        if (this.getFirstEmptySeat() >= 3) {
            Error("Can't join with more than 4 people.");
        }
        var seat = this.getFirstEmptySeat();
        var deck = this.state.mahjong.getDeck(seat);
        var player = new Player(deck, seat);
        this.state.players[client.sessionId] = player;
        this.state.seats[seat] = player;
        client.send("init", { deck: deck });
    }
    onLeave(client, consented) {
        var p1 = this.state.players[client.sessionId];
        delete this.state.players[client.sessionId];
        for (const number in this.state.seats) {
            if (this.state.seats.hasOwnProperty(number)) {
                const player = this.state.seats[number];
                if (player == p1) {
                    delete this.state.seats[number];
                    break;
                }
            }
        }
    }
    onDispose() {
    }
    getFirstEmptySeat() {
        if (!this.state.seats[0]) {
            return 0;
        }
        if (!this.state.seats[1]) {
            return 1;
        }
        if (!this.state.seats[2]) {
            return 2;
        }
        if (!this.state.seats[3]) {
            return 3;
        }
    }
}
exports.MyRoom = MyRoom;
