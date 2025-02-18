"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const responses_1 = require("./responses");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let Users = [];
let userCount = 0;
wss.on("connection", (ws) => {
    ++userCount;
    ws.on("message", (message) => {
        const parsedMsg = JSON.parse(message.toString());
        console.log(parsedMsg);
        if (parsedMsg.type == "JOIN") {
            console.log("Joining chat...");
            Users.push({ id: userCount, socket: ws, messages: [] });
            const resp = {
                id: userCount,
                type: responses_1.success,
                message: userCount.toString()
            };
            ws.send(JSON.stringify(resp));
            wss.clients.forEach((client) => {
                Users.forEach((user) => {
                    var _a;
                    if (client != ws && client == user.socket)
                        client.send(JSON.stringify({
                            id: (_a = Users.find(u => u.socket === ws)) === null || _a === void 0 ? void 0 : _a.id,
                            type: responses_1.newUser,
                            message: "New User Joined"
                        }));
                });
            });
        }
        if (parsedMsg.type == "CHAT") {
            wss.clients.forEach((client) => {
                Users.forEach((user) => {
                    var _a;
                    if (client === user.socket) {
                        const resp = {
                            id: (_a = Users.find(user => user.socket === ws)) === null || _a === void 0 ? void 0 : _a.id,
                            type: responses_1.chat,
                            message: parsedMsg.chat
                        };
                        client.send(JSON.stringify(resp));
                        console.log(resp);
                    }
                });
            });
        }
    });
});
