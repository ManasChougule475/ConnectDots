class ChatEngine{
    constructor(chatBoxId, userEmail){
        this.chatBox = $(`#${chatBoxId}`);                                  
        this.userEmail = userEmail;
        
        this.socket = io.connect('http://localhost:5000' ,{transports: ['polling']}); // io is given to us by socket.io file included in home.ejs 
        // here no one accepting the connection at 5000 right now
        // io.connect fires an event called connection
        if (this.userEmail){
            this.connectionHandler();
        }

    }


    

    connectionHandler(){ // this will have the to & fro interaction with the obeserver & the subscriber
        let self = this; // since this has been changed inside the on('connect' , f(){..})
        
        this.socket.on('connect', function(){ // on is used to detect an event ; when 'connect' evet happens , calling callback fun.
            console.log('connection established using sockets...!');

                             // 'join_room' is the name of the event , it can be any but usually same to the server side also
                             // while sending the request to join room , you can send the data {}
            self.socket.emit('join_room', { // user1 sends his request to server to join to the chatroom 'codeial' & then waits until some other user comes online
                user_email: self.userEmail, // when you click on someone's name then you want to start the chat with that user 
                chatroom: 'codeial'  // room that user want's to join // whenever 2 or more users are chatting with each other we create a virtual environment called chatroom
            });

            self.socket.on('user_joined', function(data){ // message to user1  by server regarding user2 joined ; user1 sends the request & here by 'on' message emited by the server is detected
                console.log('a user joined!', data);     
            })    


        });

        // CHANGE :: send a message on clicking the send message button
        $('#send-message').click(function(){ 
            let msg = $('#chat-message-input').val(); // fetching value from the send button

            if (msg != ''){// 1.when user clicks on send button this message if message is not empty then the send button emits an event called send_message
                self.socket.emit('send_message', {
                    message: msg,
                    user_email: self.userEmail,
                    chatroom: 'codeial'
                });
            }
        });

        self.socket.on('receive_message', function(data){ // 4. user detects the receive_message event 
            console.log('message received', data.message);


            let newMessage = $('<li>'); // 5. to consturct li and append it to ul 

            let messageType = 'other-message';

            if (data.user_email == self.userEmail){ //6. data.user_email is email of user(let say user1) who had initially made the request to the server by clicking on send button ; self.userEmail is the user who has further received this data(of user1) from server
                messageType = 'self-message'; // my message getting back me from the server also indicates that my message has been also sent to all the other users in chatroom
            }

            newMessage.append($('<span>', {
                'html': data.message
            }));

            newMessage.append($('<sub>', {
                'html': data.user_email
            }));

            newMessage.addClass(messageType);

            $('#chat-messages-list').append(newMessage); // finally appending newMessage to list
        });
    };
}

