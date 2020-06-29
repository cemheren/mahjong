import { Room, Client } from "colyseus";
import { Schema, MapSchema, type, ArraySchema } from "@colyseus/schema";
import { Mahjong } from "./mahjong";
import { Tile } from "./tile";

export class Player extends Schema {

  constructor(deck: Tile[])
  {
    super();
    this.deck = new ArraySchema<Tile>(...deck);
  }
  
  @type([Tile]) deck: ArraySchema<Tile>;
}

export class State extends Schema {
  @type("string") currentTurn: string;
  @type({ map: Player }) players = new MapSchema();
  @type(Mahjong) mahjong = new Mahjong();
  @type("number") playerCount = 0;
}

export class MyRoom extends Room {

  onCreate (options: any) {

    this.setState(new State());

    this.onMessage("chat", (client, message) => {
      this.broadcast("chat-receive", message.text);
    });
  }

  onJoin (client: Client, options: any) {
    var deck = this.state.mahjong.getDeck(this.state.playerCount);
    var player = new Player(deck);
    this.state.players[client.sessionId] = player;
    
    this.state.playerCount++;

    client.send("init", {deck: deck});
  }

  onLeave (client: Client, consented: boolean) {
    delete this.state.players[client.sessionId];
    
    this.state.playerCount--;
  }

  onDispose() {
  }
}