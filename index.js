//import Colyseus from "colyseus.js";
//import { Colyseus } from './colyseus.js';

const endpoint = (window.location.hostname.indexOf("mahjonglab") === -1)
  ? "ws://localhost:2567" // development (local)
  : "ws://mahjong.westus.azurecontainer.io:2567" // production (remote)

let client = new Colyseus.Client(endpoint);
let current_room;

client.getAvailableRooms().then(list => {
  console.log(list);
}).catch(e => {
  console.error("list error", e);
})

let sortable;
let selectedTiles = [];
let myseat;

function layTiles(){
  var selected = getSelectedTileValues();

  if (selected.length < 2) {
    alert("Please select at least 2 tiles");
  }

  current_room.send("layTiles", { tiles: selected } );

  var tilesElement = document.getElementById("tiles");
  var layedTilesElement = document.getElementById("mylayed");
  for (let i = 0; i < selectedTiles.length; i++) {
    const currentTile = selectedTiles[i];
    tilesElement.removeChild(currentTile);
    currentTile.style.border = 'none';
    currentTile.style.top = "0px";
    currentTile.style.backgroundImage = `url(./imgs/tiles_lying/${currentTile.textContent}.png)`
    layedTilesElement.appendChild(currentTile);
  }
  var space = document.createElement("div")
  space.style.width = "40px";
  layedTilesElement.appendChild(space);
  selectedTiles = [];
}

function chow(){
  layTiles();
}

function pung(){
  layTiles();
}

function kong(){
  layTiles();
}

function throwTile(){
  if (selectedTiles.length != 1) {
    alert("Need to select exactly one tile");
  }

  var currentTile = selectedTiles[0];
  current_room.send("throwTile", { tile: currentTile.textContent });
  selectedTiles = [];
  var tilesElement = document.getElementById("tiles");
  tilesElement.removeChild(currentTile);
}

function pullTile(){
  current_room.send("pullTile", "");
}

function pickUpMidTile(){
  current_room.send("pickUpMidTile", "");
}

function revertTo(){
  current_room.send("revertTo", 2);
}

function selectTile(event){
  var element = event.target;
  if (selectedTiles.includes(element)) {
    //element.style.border = 'none';
    element.style.top = "0px";
    selectedTiles = selectedTiles.filter(item => item !== element)
  }else{
    //element.style.border = '1px solid black';
    element.style.top = "-10px";
    selectedTiles.push(element);
  }
}

function initRoom(room) {
  console.log("joined successfully", room);

  room.onMessage("chat-receive", (message) => {
    var node = document.createElement("div")
    node.textContent = message;
    var div = document.getElementById("chathistory")
    div.appendChild(node);
    div.scrollTop = div.scrollHeight;
  });

  room.onMessage("clearMidTile-receive", (data) => {
    var tileElement = document.getElementById("thrownTile");
    //cleanElement(tileElement);
    if(tileElement.lastChild)
      tileElement.removeChild(tileElement.lastChild);
  });

  room.onMessage("pullTile-receive", (data) => {
    var tilesElement = document.getElementById("tiles");
    var node = document.createElement("div")
    node.style.backgroundImage = `url(./imgs/${data.tile}.png)`
    node.textContent = data.tile;
    node.onclick = selectTile;
    tilesElement.appendChild(node);
  });

  room.onMessage("throwTile-receive", (data) => {
    var tileElement = document.getElementById("thrownTile");
    var node = document.createElement("div")
    node.style.backgroundImage = `url(./imgs/tiles_lying/${data.tile}.png)`
    node.textContent = data.tile;
    //node.onclick = selectTile;
    tileElement.appendChild(node);
  });

  room.onMessage("layTilesInit-receive", (data) => {
    clearLayedTiles();
    data = data.data;

    for (let i = 0; i < data.length; i++) {
      const tilesArray = data[i].tiles;
      var sumOfTiles = 0;
      for (let j = 0; j < tilesArray.length; j++) {
        const tiles = tilesArray[j];
        var myScreen = (i + 4 - seat) % 4;

        sumOfTiles += tiles.length;
        if (myScreen == 1) {
          addLayedTilesToRight(tiles);
          redrawRight(13 - sumOfTiles);
        }

        if (myScreen == 3) {
          addLayedTilesToLeft(tiles);
          redrawLeft(13 - sumOfTiles);
        }

        if (myScreen == 2) {
          addLayedTilesToAcross(tiles);
          redrawAccross(13 - sumOfTiles);
        }

        if (myScreen == 0) {
          updateSelfLayedTiles(tiles);
        }
      }
    }

  });

  room.onMessage("layTiles-receive", (data) => {
    // don't do anything if it's me. 
    if(data.player == seat){return;}

    // 3 is left, 2 is accross, 1 is right;
    var myScreen = (data.player + 4 - seat) % 4;

    if (myScreen == 1) {
      addLayedTilesToRight(data.tiles);
      var deckElement = document.getElementById("rightdeck");
      var children = getChildValues(deckElement)
      redrawRight(children.length - data.tiles.length);
    }

    if (myScreen == 3) {
      addLayedTilesToLeft(data.tiles);
      var deckElement = document.getElementById("leftdeck");
      var children = getChildValues(deckElement)
      redrawLeft(children.length - data.tiles.length);
    }

    if (myScreen == 2) {
      addLayedTilesToAcross(data.tiles);
      var deckElement = document.getElementById("acrossdeck");
      var children = getChildValues(deckElement)
      redrawAccross(children.length - data.tiles.length);
    }
  });

  room.onMessage("init", (message) => {

    seat = message.seat;
    var infoElement = document.getElementById("info");
    infoElement.textContent = `You are player ${seat}`;

    var tilesElement = document.getElementById("tiles");
    cleanElement(tilesElement);

    if(sortable){
      message.deck.sort(function(a, b){  
        return sortable.indexOf(a.n.toString()) - sortable.indexOf(b.n.toString());
      });
    }

    message.deck.forEach(element => {
      var node = document.createElement("div")
      node.style.backgroundImage = `url(./imgs/${element.n}.png)`
      node.textContent = element.n;
      node.onclick = selectTile;
      tilesElement.appendChild(node);
    });

    redrawAccross(13);
    redrawLeft(13);
    redrawRight(13);

    var local = Sortable.create(tilesElement, 
      { 
        onSort: function(){
          sortable = getChildValues(local.el);
        }
      });
  });

  current_room = room;
}

let roomId = location.href.match(/roomId=([a-zA-Z0-9\-_]+)/);
if (roomId && roomId[1]) {
  roomId = roomId[1];

  client.joinById(roomId).then(room => {
    
    initRoom(room);

  }).catch(e => {
    alert(e);
    console.error("join error", e);
  });;
}else{

  client.create("my_room", {/* options */}).then(room => {
    window.history.pushState('page2', 'Playing on room', `?roomId=${room.id}`);
    initRoom(room);
    
  }).catch(e => {
    alert(e);
    console.error("join error", e);
  });
}

function sendChat(){
  var txt = document.getElementById("chat").value;
  current_room.send("chat", { text: txt});
}
