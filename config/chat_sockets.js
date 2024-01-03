
module.exports.chatSockets = function(socketServer){
    let io = require('socket.io')(socketServer,{  
        cors: {  //If you are using Socket.IO v3, you need to explicitly enable Cross-Origin Resource Sharing (CORS).
            //   origin: '*',    
            // origin : true,
            origin: "http://localhost:8000",   
            methods: ["GET", "POST"],   
            // credentials: true,
            }
    }); // npm install socket.io else Error: Cannot find module 'socket.io'
    
    io.on('connection', function(socket){ // io.connect (from client side chat_engine.js) fires an event called connection;  usually event occuring on client & on server side both are going to be same
        console.log('new connection received', socket.id); // whenever connection is establised we get a call back

        socket.on('disconnect', function(){  // firing an event is emiting & receiving/detecting that fired event is 'on' 
            console.log('socket disconnected');
        });   
        socket.on('reconnect', function() {
            console.log('reconnect fired!');
        });                                                                          

        
        socket.on('join_room', function(data){  // emitted data of user1 is detected here on server by 'on'
            console.log('joining request rec.', data);

            socket.join(data.chatroom);    // if chatroom already exists then user1 is joined to it , else new chatroom is created & user is entered into it.
            // here a new user is joined to the chatroom so below line will emit a new event(user_joined) with the data to all the users in that chatroom(including newly joined user i.e user1)
            io.in(data.chatroom).emit('user_joined', data); // when some other user(user2) joins the room , server emits(sends) message regarding this to the user1
        });

        // // CHANGE :: detect send_message and broadcast to everyone in the room
        socket.on('send_message', function(data){ // 2. server detects send_message event 
            io.in(data.chatroom).emit('receive_message', data); // 3. server emits a new event called receive_message to all the users within the same chatroom(data.chatroom is codeial) including the user who send the request
        });    

    });

}