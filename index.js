//import Colyseus from "colyseus.js";
//import { Colyseus } from './colyseus.js';

let client = new Colyseus.Client("ws://localhost:2567"); //https://cemherenmahjong.azurewebsites.net
//let client = new Colyseus.Client("wss://cemherenmahjong.azurewebsites.net"); //
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
  current_room.send("layTiles", { tiles: selected } );
  var tilesElement = document.getElementById("tiles");
  var layedTilesElement = document.getElementById("mylayed");
  for (let i = 0; i < selectedTiles.length; i++) {
    const currentTile = selectedTiles[i];
    tilesElement.removeChild(currentTile);
    currentTile.style.border = 'none';
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
    element.style.border = 'none';
    selectedTiles = selectedTiles.filter(item => item !== element)
  }else{
    element.style.border = '1px solid black';
    selectedTiles.push(element);
  }
}

function initRoom(room) {
  console.log("joined successfully", room);

  room.onMessage("chat-receive", (message) => {
    var node = document.createElement("div")
    node.textContent = message;
    document.getElementById("chathistory").appendChild(node);
  });

  room.onMessage("clearMidTile-receive", (data) => {
    var tileElement = document.getElementById("thrownTile");
    cleanElement(tileElement);
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

  room.onMessage("layTiles-receive", (data) => {
    // don't do anything if it's me. 
    if(data.player == seat){return;}

    // 3 is left, 2 is accross, 1 is right;
    var myScreen = (data.player + 4 - seat) % 4;

    if (myScreen == 1) {
      var layedTilesElement = document.getElementById("rightlayed");
      for (let i = 0; i < data.tiles.length; i++) {
        var currentTile = document.createElement("div")
        currentTile.style.border = 'none';
        currentTile.style.backgroundImage = `url(./imgs/tiles_lying/${data.tiles[i]}.png)`
        layedTilesElement.appendChild(currentTile);
      }
      var space = document.createElement("div")
      space.style.width = "10px";
      layedTilesElement.appendChild(space);
      selectedTiles = [];
    }

    if (myScreen == 3) {
      var layedTilesElement = document.getElementById("leftlayed");
      for (let i = 0; i < data.tiles.length; i++) {
        var currentTile = document.createElement("div")
        currentTile.style.border = 'none';
        currentTile.style.backgroundImage = `url(./imgs/tiles_lying/${data.tiles[i]}.png)`
        layedTilesElement.appendChild(currentTile);
      }
      var space = document.createElement("div")
      space.style.width = "10px";
      layedTilesElement.appendChild(space);
      selectedTiles = [];
    }

    if (myScreen == 2) {
      var layedTilesElement = document.getElementById("acrosslayed");
      for (let i = 0; i < data.tiles.length; i++) {
        var currentTile = document.createElement("div")
        currentTile.style.border = 'none';
        currentTile.style.backgroundImage = `url(./imgs/tiles_lying/${data.tiles[i]}.png)`
        layedTilesElement.appendChild(currentTile);
      }
      var space = document.createElement("div")
      space.style.width = "10px";
      layedTilesElement.appendChild(space);
      selectedTiles = [];
    }
  });

  room.onMessage("init", (message) => {

    seat = message.seat;
    var infoElement = document.getElementById("info");
    infoElement.textContent = `You are player ${seat}`;

    var tilesElement = document.getElementById("tiles");
    var accrossDeckElement = document.getElementById("acrossdeck");
    var leftDeckElement = document.getElementById("leftdeck");
    var rightDeckElement = document.getElementById("rightdeck");
    cleanElement(tilesElement);
    cleanElement(accrossDeckElement);
    cleanElement(leftDeckElement);
    cleanElement(rightDeckElement);

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

    // init opponents here. 
    for (let i = 0; i < 18; i++) {
      var node = document.createElement("div")
      node.style.backgroundImage = `url(./imgs/b.png)`
      // node.textContent = element.n;
      // node.onclick = selectTile;
      accrossDeckElement.appendChild(node);
    }
    for (let i = 0; i < 18; i++) {
      var node = document.createElement("div")
      node.style.backgroundImage = `url(./imgs/b.png)`
      // node.textContent = element.n;
      // node.onclick = selectTile;
      leftDeckElement.appendChild(node);
    }
    for (let i = 0; i < 18; i++) {
      var node = document.createElement("div")
      node.style.backgroundImage = `url(./imgs/b.png)`
      // node.textContent = element.n;
      // node.onclick = selectTile;
      rightDeckElement.appendChild(node);
    }

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

function cleanElement(parent){
  while (parent.firstChild) {
    parent.firstChild.remove();
  }
}

function getChildValues(parent){
  var children = parent.children;
  var result = [];
  for (var i = 0; i < children.length; i++) {
    var text = children[i].textContent;
    result.push(text);
  }

  return result;
}

function getSelectedTileValues(){
  var result = [];
  for (var i = 0; i < selectedTiles.length; i++) {
    var text = selectedTiles[i].textContent;
    result.push(text);
  }

  return result;
}