//import Colyseus from "colyseus.js";
//import { Colyseus } from './colyseus.js';

let client = new Colyseus.Client("ws://localhost:2567");
let current_room;

client.getAvailableRooms().then(list => {
  console.log(list);
}).catch(e => {
  console.error("list error", e);
})

function initRoom(room) {
  console.log("joined successfully", room);

  room.onMessage("chat-receive", (message) => {
    var node =document.createElement("div")
    node.textContent = message;
    document.getElementById("chathistory").appendChild(node);
  });

  room.onMessage("init", (message) => {
    message.deck.forEach(element => {
      var node = document.createElement("div")
      node.style.backgroundImage = `url(./imgs/${element.n}.png)`
      node.textContent = element.n;
      document.getElementById("mydeck").appendChild(node);
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

