const express = require('express');
const port = 2006;
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const cors = require("cors");

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(express.static("public"));
app.use(cors());

app.get("/", (req, res) => {
    return res.send("Hello World!");
})

const users = {};


io.on("connection", socket => {

    socket.on("newUserJoined", ({name,room}) => {
        if (room.length===0){
            room="Global"
        }
        socket.join(room)
        let user ={id: socket.id,name,room}
        users[socket.id]=user;
        io.to(room).emit("userJoined", name)
    })

    socket.on("send",( {input,room})=> {
        if (room.length===0){
            room="Global"
        }
        if(room){
        io.to(room).emit("receive", {id:users[socket.id].id, message: input, name: users[socket.id].name })
        }
    })

    socket.on("disconnect", () => {
        if(users[socket.id]){
            io.to(users[socket.id].room).emit("userDisconnected", users[socket.id].name)
            delete users[socket.id]
        }
    }
    );

})

server.listen(port, () => {
    console.log(`The app is running on port ${port}`)
})