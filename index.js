//import Colyseus from "colyseus.js";
//import { Colyseus } from './colyseus.js';

let client = new Colyseus.Client("ws://localhost:2567");
let current_room;

client.getAvailableRooms().then(list => {
  console.log(list);
}).catch(e => {
  console.error("list error", e);
})

let selectedTiles = [];

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
    var node =document.createElement("div")
    node.textContent = message;
    document.getElementById("chathistory").appendChild(node);
  });

  room.onMessage("pullTile-receive", (data) => {
    var tilesElement = document.getElementById("tiles");
    var node = document.createElement("div")
    node.style.backgroundImage = `url(./imgs/${data.tile}.png)`
    node.textContent = data.tile;
    node.onclick = selectTile;
    tilesElement.appendChild(node);
  });

  room.onMessage("init", (message) => {

    var tilesElement = document.getElementById("tiles");
    cleanElement(tilesElement);

    message.deck.forEach(element => {
      var node = document.createElement("div")
      node.style.backgroundImage = `url(./imgs/${element.n}.png)`
      node.textContent = element.n;
      node.onclick = selectTile;
      tilesElement.appendChild(node);
    });

    Sortable.create(tilesElement, { /* options */ });
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