import { Room, Client } from "colyseus";
import { Schema, MapSchema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("number") x: number;
  @type("number") y: number;
}

export class State extends Schema {
  @type("string") currentTurn: string;
  @type({ map: Player }) players = new MapSchema();
}

export class MyRoom extends Room {

  onCreate (options: any) {
    this.setState(new State());
    this.onMessage("chat", (client, message) => {
      this.broadcast("chat-receive", message.text);
    });
  }

  onJoin (client: Client, options: any) {
    this.state.players[client.sessionId] = new Player();
  }

  onLeave (client: Client, consented: boolean) {
    delete this.state.players[client.sessionId];
  }

  onDispose() {
  }
}