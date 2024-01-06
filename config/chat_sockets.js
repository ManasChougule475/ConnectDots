
// module.exports.chatSockets = function(socketServer){
//     let io = require('socket.io')(socketServer,{  
//         cors: {  //If you are using Socket.IO v3, you need to explicitly enable Cross-Origin Resource Sharing (CORS).
//             //   origin: '*',    
//             // origin : true,
//             origin: "http://localhost:8000",   
//             methods: ["GET", "POST"],   
//             // credentials: true,
//             }
//     }); // npm install socket.io else Error: Cannot find module 'socket.io'
    
//     io.on('connection', function(socket){ // io.connect (from client side chat_engine.js) fires an event called connection;  usually event occuring on client & on server side both are going to be same
//         console.log('new connection received', socket.id); // whenever connection is establised we get a call back

//         socket.on('disconnect', function(){  // firing an event is emiting & receiving/detecting that fired event is 'on' 
//             console.log('socket disconnected');
//         });   
//         socket.on('reconnect', function() {
//             console.log('reconnect fired!');
//         });                                                                          

        
//         socket.on('join_room', function(data){  // emitted data of user1 is detected here on server by 'on'
//             console.log('joining request rec.', data);

//             socket.join(data.chatroom);    // if chatroom already exists then user1 is joined to it , else new chatroom is created & user is entered into it.
//             // here a new user is joined to the chatroom so below line will emit a new event(user_joined) with the data to all the users in that chatroom(including newly joined user i.e user1)
//             io.in(data.chatroom).emit('user_joined', data); // when some other user(user2) joins the room , server emits(sends) message regarding this to the user1
//         });

//         // // CHANGE :: detect send_message and broadcast to everyone in the room
//         socket.on('send_message', function(data){ // 2. server detects send_message event 
//             io.in(data.chatroom).emit('receive_message', data); // 3. server emits a new event called receive_message to all the users within the same chatroom(data.chatroom is codeial) including the user who send the request
//         });    

//     });

// }



const express = require('express');
const router = express.Router();
const Message = require('../models/message');


// Create an object to store socket associated with each user so that chat is delievered only to to_user & from_user(userEmail) 
const userSockets = {};  


module.exports.chatSockets = function(socketServer) {
    const io = require('socket.io')(socketServer, {
        cors: {
            origin: "http://13.127.17.176:8000",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', function(socket) {
        console.log('new connection received', socket.id);

        socket.on('disconnect', function() {
            console.log('socket disconnected');
        });
        socket.on('reconnect', function() {
            console.log('reconnect fired!');
        });

        socket.on('join_room', function(data) {
            console.log('joining request receivedd.', data);
            socket.join(data.chatroom);
            io.in(data.chatroom).emit('user_joined', data);
        });


        socket.on('join_personal_room', function(data) {
            console.log('joining request received profile.', data);
            userSockets[data.user_email] = socket;
            socket.join(data.chatroom);
            io.in(data.chatroom).emit('user_joined2', data);
        });


        socket.on('send_message', async function(data) {
            console.log('in send');
            const newMessage = new Message({
                user_email: data.user_email,
                message: data.message,
                to_user: data.to_user    
            });

            try {
                await newMessage.save();
            } catch (error) {
                console.error('Error saving message to MongoDB:', error);
            }
            io.in(data.chatroom).emit('receive_message', data);
        });


        socket.on('send_message2', async function(data) {
            console.log('in send2');
            const newMessage = new Message({
                user_email: data.user_email,
                message: data.message,
                to_user: data.to_user   
            });

            try {
                await newMessage.save();
            } catch (error) {
                console.error('Error saving message to MongoDB:', error);
            }

            //  io.in(data.chatroom).emit('receive_message2', data);  
            // in above case if user1 sends message to user2 then it is also displayed to user3 (message is broadcasted to all users including user who sent message)
            // cause chatroom for all is same i.e codeial_personal , hence below sending message only to user1 & user2 to display it
            // (messages sent in codeial_personal(local) chatroom will not be visible in codeial(global) classroom)


            if(userSockets[data.user_email]){
                // console.log('^^^^^^^',userSockets[data.user_email])
                userSockets[data.user_email].emit('receive_message2', data);
            }
            if(userSockets[data.to_user]){
                // console.log('#######',userSockets[data.to_user])
                userSockets[data.to_user].emit('receive_message2', data);
            }

        });

        router.get('/api/getPreviousMessages', async (req, res) => {
            try {
                const messages = await Message.find().exec();
                res.json({ messages });
            } catch (error) {
                console.error('Error fetching previous messages:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    });
};





