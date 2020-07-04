//import Colyseus from "colyseus.js";
//import { Colyseus } from './colyseus.js';

let client = new Colyseus.Client("ws://localhost:2567");
let current_room;

client.getAvailableRooms().then(list => {
  console.log(list);
}).catch(e => {
  console.error("list error", e);
})

let sortable;
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

function updateSort(){
  // sortedTiles = [];
  // var tilesElement = document.getElementById("tiles");
  // var child = tilesElement.firstChild;

  // sortedTiles.push(child.textContent);

  // while(child) {
  //     child = child.nextSibling;
  //     if(child)
  //       sortedTiles.push(child.textContent);
  // }
}

function initRoom(room) {
  console.log("joined successfully", room);

  room.onMessage("chat-receive", (message) => {
    var node = document.createElement("div")
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

    var local = Sortable.create(tilesElement, 
      { 
        onSort: function(){
          sortable = getChildValues(local.el);
        },
        // store: {
        //   get: function(){
        //     return sortable;
        //   },
        //   set: function (local) {
        //     sortable = local.toArray(); 
        //   }
        // }
      });

    // if(sortable){
    //   //var arr = sortable.toArray();
    //   // arr.sort(function(a, b){  
    //   //   return sortedTiles.indexOf(a.textContent) - sortedTiles.indexOf(b.textContent);
    //   // });
    //   local.sort(sortable);
    // }
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