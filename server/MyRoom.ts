import { Room, Client } from "colyseus";
import { Schema, MapSchema, type, ArraySchema } from "@colyseus/schema";
import { Mahjong } from "./mahjong";
import { Tile } from "./tile";

export class Player extends Schema {

  constructor(deck: Tile[], seat: number)
  {
    super();
    this.deck = new ArraySchema<Tile>(...deck);
    this.seat = seat;
  }
  
  @type([Tile]) deck: ArraySchema<Tile>;
  @type("number") seat: number;
}

export class State extends Schema {
  @type("string") currentTurn: string;
  @type({ map: Player }) players = new MapSchema();
  @type({ map: Player }) seats = new MapSchema();
  @type(Mahjong) mahjong = new Mahjong();
  @type(Player) turn : Player;
}

export class MyRoom extends Room {

  onCreate (options: any) {

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
      client.send("pullTile-receive", {tile: tile.n});
    });

    this.onMessage("throwTile", (client, data) => {
      var p1 = this.state.players[client.sessionId];
      this.broadcast("chat-receive", `Player ${p1.seat} has thrown a ${data.tile}`);

      var deck = this.state.mahjong.removeFromDeck(p1.seat, data.tile);
      
      // change to custom command.
      // client.send("init", {deck: deck});
    });
  }

  onJoin (client: Client, options: any) {
    if (this.getFirstEmptySeat() >= 3) {
      Error("Can't join with more than 4 people.");
    }

    var seat = this.getFirstEmptySeat();
    var deck = this.state.mahjong.getDeck(seat);
    
    var player = new Player(deck, seat);
    this.state.players[client.sessionId] = player;
   
    this.state.seats[seat] = player;

    client.send("init", {deck: deck});
  }

  onLeave (client: Client, consented: boolean) {
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

  getFirstEmptySeat(){
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