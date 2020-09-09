const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const socketio = require('socket.io');
const axios = require('axios');

const http = require('http');
const path = require('path');
require('dotenv').config();


const { addUser , removeUser, getUser, getUsersInRoom, changeUsername , removeRoom , getAllRooms, setLastMessage} = require('./users');

// set up express
const app = express();
const server = http.createServer(app);  
const io = socketio(server);



app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded());
app.use(express.json());
app.use(cors());


const port = process.env.PORT || 4000;

server.listen(port,() => console.log(`the server has started on port ${port}`));


// app.set('views','./views');
// app.set('view engine','ejs');


// run when a client connects
io.on('connection',socket => {
    socket.emit('getRooms',{rooms:ActiveRooms()})

    socket.on('join',({ username, room , owner = false},callback) => {
     
        if(owner){
            let rooms = getAllRooms();
            if(rooms.find(element => element.room === room)){
                return  callback({error:'Room name already taken'});
            }
            else{
                io.emit('message',{message:`Server : Room ${room} has been created`});
            }
        }
        const { error , user } = addUser({ id: socket.id, username, room, owner});
    
        if(error){ return callback({error}); }
        socket.emit('message',{message:`Server : ${user.username} welcome to the ${user.room} room`});
        socket.broadcast.to(user.room).emit('message',{message: `Server : ${user.username} joined the room`});

        socket.join(user.room);

        io.to(room).emit('users list',getUsersInRoom(room));


        socket.on('Change username',(newUsername) => {
         
            changeUsername({id:socket.id, username:newUsername});
            io.emit('message',{ message:`Server : ${username} from the room '${room}' has changed his username for ${newUsername} `});
            io.to(room).emit('users list',getUsersInRoom(room));
        })
    
        socket.on('sendMessage',(message, callback) => {
            const user = getUser(socket.id);
            if(!user){ return callback({error:'No user'}); }
            io.to(user.room).emit('message',{username: user.username, message:message});
            //set last date message
            setLastMessage({room:user.room});
            
        })

        let check = setInterval(function(){
            let now = new Date().getTime();
            let rooms = getAllRooms();  
            if(rooms){
                let found = rooms.find(element => element.room === user.room)
                if(found && found.room){
                    if(found.limitDate <= now){
                        let usrs = getUsersInRoom(room);
                        for(i = 0 ; i < usrs.length ; i++){
                            removeUser(usrs[i]);
                        }
                        removeRoom(room);
                        io.emit('message',{message:`Server : Room ${room} has been deleted`});
                        io.to(room).emit('redirection',{link: '/'});
                    }
                }
            }  
         }, 60*60000);
        
        socket.on('getAllRooms',({},callback) => {
            const rooms = getAllRooms();
            if(!rooms){ return callback({result:'No rooms'}); }else{return callback({result:rooms})}
        })

        socket.on('getRegexList',(string,callback) => {
            console.log(string);
            const rooms = getAllRooms();

            if(rooms){
                tmp = [];
                var regex = new RegExp(string, "g");
                for( let i = 0 ; i < rooms.length ; i++){
                    let found = rooms[i].room.match(regex);
                    if(found){
                        tmp.push(rooms[i]);
                    }
                }
                if(tmp.length > 0){
                    return callback(tmp)
                }
                else{
                    return callback(['No rooms for this string'])
                }
            }
            else{
                return callback(['No rooms']);
            }
        })

        socket.on('checkRoom',(newRoom, callback) => {
     
            let rooms = getAllRooms();  
            if(rooms){
                let find = rooms.find(element => element.room === newRoom)
                if(find){
                    return callback({error:'Server : Room name already taken'});
                }
            }  
            
            socket.emit('redirection',{link: `/irc?createRoom=${newRoom}&username=${username}`});
        })

        socket.on('joinRoom',(newRoom, callback) => {
     
            let users = getUsersInRoom(newRoom) 
 
            if(users.length == 0){
                return callback({error:'Server : Room dosen\'t exist'});
            }  
            else{
                let find = users.find(element => element.username === user.username)
                if(find){
                    return callback({error:'Server : Username already taken in this room'});
                }else{
                    socket.emit('redirection',{link: `/irc?room=${newRoom}&username=${user.username}`});
                }
            }
        })

        socket.on('whisper',({receiver,message}, callback) => {
       
            users = getUsersInRoom(user.room);
            let foundUser = users.find(element => element.username === receiver)

            if(foundUser){
                if(foundUser.username != user.username){
                    io.to(foundUser.id).emit('message',{message:`Private from ${user.username} : ${message}`});
                    socket.emit('message',{message:`Sent to ${foundUser.username} : ${message}`})
                }
                else{
                    return callback({error:'Server : You can\'t private message yourself '});
                }
            }   
            else{
                return callback({error:'Server : This user dosen\'t exist'});
            }
        })

        socket.on('deleteRoom',() => {
            let usrs = getUsersInRoom(room);
            for(i = 0 ; i < usrs.length ; i++){
                removeUser(usrs[i]);
            }
            removeRoom(room);
            io.emit('message',{message:`Server : Room ${room} has been deleted`});
            io.to(room).emit('redirection',{link: '/'});
        })

        socket.on('disconnect',() => {
            removeUser(socket.id);
            socket.broadcast.to(room).emit('message',{message: `Server : ${username} has left room`});
            io.to(room).emit('users list',getUsersInRoom(room));
            if(getUsersInRoom(room).length < 1|| getUsersInRoom(room) == undefined){
                removeRoom(room);
                clearInterval(check);
                if(getAllRooms().find(element => element.room === room)){
                    io.emit('message',{message:`Server : Room ${room} has been deleted`});
                }
            }
        })
    })
})

function ActiveRooms(){
    var activeRooms = [];
    Object.keys(io.sockets.adapter.rooms).forEach(room=>{
        var isRoom = true;
        Object.keys(io.sockets.adapter.sids).forEach(id=>{
            isRoom = (id === room)? false: isRoom;
        });
        if(isRoom)activeRooms.push(room);
    });
    return activeRooms;
}
