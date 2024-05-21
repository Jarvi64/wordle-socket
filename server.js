const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require('cors');

const io = new Server(server, {
    cors: {
      origin: ["http://localhost:4200","https://ng-wordle-w2ka.vercel.app"],
      methods: ["GET", "POST"],
    }
});

app.use(cors());

let users = [];
let rooms = [];
io.on('connection', (socket) => {

    socket.on("create room",(roomID,word) => {
        rooms.push({roomId:roomID,word:word});
        socket.join(roomID);
        console.log(rooms);
    })

    socket.on("Join room", (roomId) => {
        let roomIndex = rooms.findIndex(x => x.roomId === roomId);
        if (roomIndex !== -1) { // Check if the room exists
            let room = rooms[roomIndex];
            socket.join(roomId);
            socket.emit("joined_room");
            console.log(room.word);
            io.to(roomId).emit('player_joined', room.word); 
        } else {
            socket.emit("room_error");
        }
    });

    socket.on('game_update',(event,roomId)=>{
        console.log(event);
        socket.broadcast.to(roomId).emit('key_update', event);
    })

    socket.on('game over',(event,roomId)=>{
        console.log(event);
        socket.broadcast.to(roomId).emit('You_Lost', event);
    })

    socket.on('reset word',(roomID,word)=>{
        io.to(roomId).emit('player_joined', room.word); 
    })

    socket.on('disconnect', () => {

        console.log('User disconnected:', socket.id);
    });

});


server.listen(3000, () => {
    console.log('listening on *:3000');
});
