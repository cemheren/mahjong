import { Room, Client } from "colyseus";
import { Schema, MapSchema, type, ArraySchema } from "@colyseus/schema";
import { Mahjong } from "./mahjong";
import { Tile } from "./tile";

export class Player extends Schema {

  constructor(deck: Tile[], seat: number, sessionId:string)
  {
    super();
    this.deck = new ArraySchema<Tile>(...deck);
    this.seat = seat;
    this.sessionId = sessionId;
  }
  
  @type([Tile]) deck: ArraySchema<Tile>;
  @type("number") seat: number;
  @type("string") sessionId: string;
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
      
      this.state.mahjong.saveHistory();
      
      var tile = this.state.mahjong.drawTile();

      if (tile == undefined) {
        this.broadcast("chat-receive", `The wall has no more tiles.`);
        return;      
      }

      this.broadcast("chat-receive", `Player ${p1.seat} has pulled from wall`);
      var deck = this.state.mahjong.addToDeck(p1.seat, tile.n);
      
      // change to custom command.
      client.send("pullTile-receive", {tile: tile.n});
    });

    this.onMessage("revertTo", (client, data) => {
      var p1 = this.state.players[client.sessionId];

      var result = this.state.mahjong.loadHistory(data);
      if (!result) {
        this.broadcast("chat-receive", `Player ${p1.seat} failed to revert the game`);        
      }else{
        this.broadcast("chat-receive", `Player ${p1.seat} has reverted the game ${data} turns`);
        
        this.forceUpdate(0);
        this.forceUpdate(1);
        this.forceUpdate(2);
        this.forceUpdate(3);

        this.broadcast("clearMidTile-receive", {} );
        this.sendLayedTilesInit();
      }
    });

    this.onMessage("throwTile", (client, data) => {
      var p1 = this.state.players[client.sessionId];
      this.broadcast("chat-receive", `Player ${p1.seat} has thrown a ${data.tile}`);

      this.state.mahjong.saveHistory();

      var deck = this.state.mahjong.removeFromDeck(p1.seat, data.tile);
      this.state.mahjong.setMidTile(data.tile);
      this.broadcast("throwTile-receive", {tile: data.tile});
      
    });

    this.onMessage("pickUpMidTile", (client, data) => {
      var p1 = this.state.players[client.sessionId];
      
      var tile = this.state.mahjong.state.midTile;

      if (tile == -1) {
        this.broadcast("chat-receive", `No pickable mid tile`);
        return;
      }

      this.state.mahjong.saveHistory();
      
      this.broadcast("chat-receive", `Player ${p1.seat} has pulled a ${tile}`);
      var deck = this.state.mahjong.addToDeck(p1.seat, tile);
      
      this.state.mahjong.setMidTile(null);

      // change to custom command.
      client.send("pullTile-receive", {tile: tile});
      this.broadcast("clearMidTile-receive", {tile: tile});
    });

    this.onMessage("layTiles", (client, data) => {
      var p1 = this.state.players[client.sessionId];
      
      this.state.mahjong.saveHistory();
      
      var tile = this.state.mahjong.addToLayedTiles(p1.seat, data.tiles);
      this.broadcast("chat-receive", `Player ${p1.seat} layed ${data.tiles} tiles`);
      var deck = this.state.mahjong.removeFromDeck2(p1.seat, data.tiles);
      
      this.broadcast("layTiles-receive", {tiles: data.tiles, player: p1.seat});
    });
  }

  sendLayedTilesInit(){

    var zerosTiles = this.state.mahjong.getLayedTiles(0);
    var onesTiles = this.state.mahjong.getLayedTiles(1);
    var twosTiles = this.state.mahjong.getLayedTiles(2);
    var threesTiles = this.state.mahjong.getLayedTiles(3);

    this.broadcast("layTilesInit-receive", {
      data : [
        {tiles: zerosTiles, player: 0},
        {tiles: onesTiles, player: 1},
        {tiles: twosTiles, player: 2},
        {tiles: threesTiles, player: 3},
      ]});
  }

  forceUpdate(at: number){
    var deck = this.state.mahjong.getDeck(at);
    var player = this.state.seats[at];

    if (!player || player == undefined) {
      //console.log(`player ${at} was not found`);
      return;
    }

    //console.log(`player ${at} sessionId is ${player.sessionId}`);

    var client = this.clients.find(client => client.sessionId == player.sessionId);
    client.send("init", {deck: deck, seat: at});
  }

  onJoin (client: Client, options: any) {
    if (this.getFirstEmptySeat() >= 3) {
      Error("Can't join with more than 4 people.");
    }

    var seat = this.getFirstEmptySeat();
    var deck = this.state.mahjong.getDeck(seat);
    
    var player = new Player(deck, seat, client.sessionId);
    this.state.players[client.sessionId] = player;
   
    this.state.seats[seat] = player;

    client.send("init", {deck: deck, seat: seat});
    this.sendLayedTilesInit();
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