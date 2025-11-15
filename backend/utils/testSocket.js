const { io } = require("socket.io-client");

const socket = io("ws://localhost:5050", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Connected as client:", socket.id);

  socket.emit("sendMessage", {
    senderId: "68d83628930261208d2a8bd2",
    receiverId: "68db22471505c73d70fb629f",
    text: "hi test",
    itemId: "68d837f2930261208d2a8bdd"
  });
});

socket.on("receiveMessage", (msg) => {
  console.log("Received message:", msg);
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});