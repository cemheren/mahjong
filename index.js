//import Colyseus from "colyseus.js";
//import { Colyseus } from './colyseus.js';

let client = new Colyseus.Client("ws://localhost:2567");
let current_room;

client.getAvailableRooms().then(list => {
  console.log(list);
}).catch(e => {
  console.error("list error", e);
})

client.joinOrCreate("my_room", {/* options */}).then(room => {
  console.log("joined successfully", room);

  room.onMessage("chat-receive", (message) => {
    var node =document.createElement("div")
    node.textContent = message;
    document.getElementById("chathistory").appendChild(node);
  });

  current_room = room;
}).catch(e => {
  console.error("join error", e);
});

function sendChat(){
  var txt = document.getElementById("chat").value;
  current_room.send("chat", { text: txt});
}

