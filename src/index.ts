import { WebSocket, WebSocketServer } from "ws";
import { chat, newUser, success } from "./responses";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  id: number;
  socket: WebSocket;
  messages: string[];
}

interface Response {
  id: number;
  type: string;
  message: string;
}

let Users: User[] = [];
let userCount = 0;

wss.on("connection", (ws: WebSocket) => {
  ++userCount;
  ws.on("message", (message) => {
    const parsedMsg = JSON.parse(message.toString());
    console.log(parsedMsg);
    if (parsedMsg.type == "JOIN") {
      console.log("Joining chat...");
      Users.push({ id: userCount, socket: ws, messages: [] });
      const resp: Response = {
        id: userCount,
        type: success,
        message: userCount.toString()
      }
      ws.send(JSON.stringify(resp));
      wss.clients.forEach((client) => {
        Users.forEach((user) => {
          if (client != ws && client == user.socket) client.send(
            JSON.stringify({
              id: Users.find(u => u.socket === ws)?.id,
              type: newUser,
              message: "New User Joined"
            })
          );
        });
      });
    }
    if (parsedMsg.type == "CHAT") {
      wss.clients.forEach((client) => {
        Users.forEach((user) => {
          if (client === user.socket) {
            const resp = {
              id: Users.find(user => user.socket === ws)?.id,
              type: chat,
              message: parsedMsg.chat
            }
            client.send(JSON.stringify(resp));
            console.log(resp);
          }
        });
      });
    }
  });
});
